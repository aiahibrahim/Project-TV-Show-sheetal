
document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = "https://api.tvmaze.com/shows";
  
    const showSelector = document.getElementById("show-selector"); // TV show dropdown
    const episodeSelector = document.getElementById("episode-selector"); // Episode dropdown
    const searchInput = document.getElementById("search-input"); // Search input field
    const resultCount = document.getElementById("search-result-count"); // Result count display
  
    let allEpisodes = []; // Store episodes globally
    let allShows = []; // Store all shows globally
  
    // Fetch all TV shows from TVMaze API
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load shows");
        }
        return response.json();
      })
      .then((data) => {
        allShows = data.sort((a, b) => a.name.localeCompare(b.name)); // Sort shows alphabetically
        populateShowSelector(allShows); // Populate the show selector dropdown
      })
      .catch((error) => {
        resultCount.textContent = "Error: Unable to fetch shows. Please try again.";
        console.error(error);
      });
  
    // Function to populate the show selector dropdown
    function populateShowSelector(shows) {
      showSelector.innerHTML = '<option value="">Select a show</option>'; // Reset the dropdown
      shows.forEach((show) => {
        let option = document.createElement("option");
        option.value = show.id; // Set the show ID as the value
        option.textContent = show.name; // Set the show name as the text
        showSelector.appendChild(option);
      });
    }
  
    // Event listener for when a user selects a show
    showSelector.addEventListener("change", () => {
      const selectedShowId = showSelector.value;
      if (selectedShowId !== "") {
        resultCount.textContent = "Loading episodes...";
        fetchEpisodes(selectedShowId); // Fetch the episodes for the selected show
      } else {
        resultCount.textContent = "Please select a show.";
        makePageForEpisodes([]); // Clear episodes if no show is selected
      }
    });
  
    // Function to fetch episodes for a selected show
    function fetchEpisodes(showId) {
      const episodesApiUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;
      fetch(episodesApiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load episodes");
          }
          return response.json();
        })
        .then((data) => {
          allEpisodes = data; // Store the fetched episodes
          setup(allEpisodes); // Set up the page with episodes
        })
        .catch((error) => {
          resultCount.textContent = "Error: Unable to load episodes.";
          console.error(error);
        });
    }
  
    // Function to set up the page with episodes
    function setup(allEpisodes) {
      makePageForEpisodes(allEpisodes);
      setupSearchFeature(allEpisodes);
      setupEpisodeSelector(allEpisodes);
    }
  
    // Function to display episodes
    function makePageForEpisodes(episodeList) {
      const rootElem = document.getElementById("root");
      rootElem.innerHTML = ""; // Clear previous content
      const template = document.getElementById("episode-card-template");
  
      episodeList.forEach((episode) => {
        const episodeCard = template.content.cloneNode(true); // Clone the template content
        const episodeNumber = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
  
        episodeCard.querySelector(".episode-name").textContent = highlightText(`${episode.name} - ${episodeNumber}`);
        episodeCard.querySelector("img").src = episode.image ? episode.image.medium : "placeholder.jpg"; // Fallback image
        episodeCard.querySelector("[data-summary]").innerHTML = highlightText(episode.summary || "No summary available.");
  
        const cardElement = episodeCard.querySelector(".episode-card");
        cardElement.id = `episode-${episode.id}`; // Assume unique ID for scrolling
  
        rootElem.appendChild(episodeCard);
      });
    }
  
    // Function to highlight search term in the episode summary
    function highlightText(text) {
      const searchTerm = searchInput.value.trim().toLowerCase();
      if (!searchTerm) return text; // No search term, return the original text
  
      const regex = new RegExp(`(${searchTerm})`, "gi"); // Regex to match the search term, case insensitive
      return text.replace(regex, '<span class="highlight">$1</span>'); // Wrap the search term with a span
    }
  
    // Function to handle search functionality
    function setupSearchFeature(allEpisodes) {
      searchInput.addEventListener("input", () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
  
        const filteredEpisodes = allEpisodes.filter(
          (episode) => episode.name.toLowerCase().includes(searchTerm) || episode.summary.toLowerCase().includes(searchTerm)
        );
  
        makePageForEpisodes(filteredEpisodes); // Display filtered episodes
  
        const filteredCount = filteredEpisodes.length;
        const totalCount = allEpisodes.length;
  
        resultCount.textContent =
          searchTerm === "" ? "Displaying all episodes" : `${filteredCount} episode(s) found out of ${totalCount} total episodes`;
      });
    }
  
    // Function to populate the episode selector dropdown
    function updateEpisodeSelector(episodeList) {
      episodeSelector.innerHTML = ""; // Clear existing options
  
      const showAllOption = document.createElement("option");
      showAllOption.value = "all";
      showAllOption.textContent = "Show All Episodes";
      episodeSelector.appendChild(showAllOption);
  
      episodeList.forEach((episode) => {
        const episodeNumber = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
        const option = document.createElement("option");
        option.value = episode.id;
        option.textContent = `${episodeNumber} - ${episode.name}`;
        episodeSelector.appendChild(option);
      });
    }
  
    // Function to handle episode selection
    function setupEpisodeSelector(allEpisodes) {
      updateEpisodeSelector(allEpisodes);
  
      episodeSelector.addEventListener("change", function () {
        if (this.value === "all") {
          makePageForEpisodes(allEpisodes); // Show all episodes
        } else {
          const selectedEpisode = allEpisodes.find((episode) => episode.id == this.value);
          makePageForEpisodes([selectedEpisode]); // Show only the selected episode
          setTimeout(() => {
            scrollToEpisode(this.value);
          }, 100);
        }
      });
    }
  
    // Function to scroll to the selected episode
    function scrollToEpisode(episodeId) {
      const episodeCard = document.getElementById(`episode-${episodeId}`);
      if (episodeCard) {
        episodeCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  });
  
  
