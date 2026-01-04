console.log("✅ search.js loaded");

// Global to cache the movie returned by OMDB
let movieInfo = null;

function getMovie() {
  const searchTerm = document.getElementById("movie-name").value.trim();
  if (!searchTerm) return;

  const movieDiv   = document.getElementById("movieDiv");
  const table      = document.querySelector("#searchResultsTable");
  const posterGrid = document.querySelector(".poster-grid");

  movieDiv.innerHTML = "";
  table.innerHTML    = "";
  if (posterGrid) posterGrid.style.display = "none";

  fetch(`/movies/${searchTerm}`)
    .then(r => r.json())
    .then(data => {
      if (data.Response === "False") {
        movieDiv.textContent = "No movie found";
        return;
      }

      // Show search‑area sections once we have a result
      document.querySelectorAll(".search-area").forEach(el => el.style.display = "block");

      movieInfo = data; // cache for later «add to watchlist»
      const { Title:title, Ratings, Year:year, Director:director, Actors:actors, Poster:poster, imdbID } = data;

      movieDiv.innerHTML = `<h3>Movies matching: "${searchTerm}"</h3>`;
      const row   = table.insertRow();
      const img   = new Image();
      img.src     = poster;

      const dropdownId = `watchlistDropdown-${imdbID}`;

      row.insertCell().appendChild(img);                               // Poster
      row.insertCell().innerHTML = `<a href="/movie/${imdbID}" class="movie-title-link">${title}</a><br><b>${Ratings?.[0]?.Value || "N/A"}</b>`;
      row.insertCell().textContent = year;
      row.insertCell().textContent = director;
      row.insertCell().textContent = actors;
      row.insertCell().innerHTML = `
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" data-dropdown-id="${dropdownId}">
            Add to Watchlist
          </button>
          <ul class="dropdown-menu" id="${dropdownId}"></ul>
        </div>`;
    })
    .catch(err => console.error("Fetch error", err));
}

document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();
  getMovie();
});

// Create new watchlist from navbar button
const newListBtn = document.getElementById("create-new-list");
if (newListBtn) newListBtn.addEventListener("click", () => promptAndCreateList());

function promptAndCreateList() {
  const name = prompt("Please enter the name of the new watchlist:");
  if (!name) return;

  fetch("/createNewList", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listName: name })
  })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        alert("✅ Watchlist created successfully!");
      } else {
        alert(res.message || "Failed to create watchlist");
      }
    })
    .catch(err => console.error(err));
}

// ---------- Off‑canvas «My Watchlists» ----------
$(document).on("click", "[data-bs-toggle='offcanvas']", function () {
  const body = $(".offcanvas-body").empty();
  $.get("/user/myCreatedWatchlists", data => {
    const lists = data.createdLists || [];
    lists.forEach(w => {
      const link = $(
        `<div><a class='btn btn-light w-100 mb-1' href='/watchlist/${w._id}'>${w.name}</a></div>`
      );
      body.append(link);
    });
  });
});

// ---------- Dropdown: load watchlists on click ----------
$(document).on("click", "[data-bs-toggle='dropdown']", function () {
  const dropdownId  = $(this).data("dropdown-id");
  const dropdown    = $("#" + dropdownId).empty();

  $.get("/user/myCreatedWatchlists", data => {
    const lists = data.createdLists || [];
    lists.forEach(w => {
      dropdown.append(
        `<li><a href='#' class='dropdown-item' data-list-id='${w._id}' data-dropdown-id='${dropdownId}'>${w.name}</a></li>`
      );
    });
    dropdown.append(
      `<li><a href='#' id='create-new-watchlist' class='dropdown-item text-primary' data-dropdown-id='${dropdownId}'>➕ Create New Watchlist</a></li>`
    );
  });
});

// ---------- Handle clicks inside the dropdown ----------
$(document).on("click", "#create-new-watchlist, a[data-list-id]", function (e) {
  e.preventDefault();
  const dropdownId = $(this).data("dropdown-id");

  // Create new list
  if (this.id === "create-new-watchlist") {
    return promptAndCreateList();
  }

  // Add movie to existing list
  if (!movieInfo) return alert("Please search for a movie first.");

  const listId = $(this).data("list-id");
  const { Title:title, imdbID, Year:year, Poster:poster, Director:director } = movieInfo;

  $.post("/add_movie_to_watchlist", { collectionID: listId, title, imdbID, year, poster, director }, res => {
    if (res.success) {
      alert("✅ Movie added to watchlist!");
    } else {
      alert(res.message || "Failed to add movie.");
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('createWatchlistBtn');
  if(!btn) return;

  btn.addEventListener('click', async () => {
    const name = prompt('Please enter a name for the new watchlist:');
    if(!name) return;

    try{
      const res = await fetch('/createNewList',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ listName:name })
      });
      const data = await res.json();
      if(data.success){
        alert('✅ Watchlist created!');
        location.reload();
      }else{
        alert('❌ '+(data.message || 'Failed'));
      }
    }catch(err){
      console.error(err);
      alert('❌ Network error');
    }
  });
});