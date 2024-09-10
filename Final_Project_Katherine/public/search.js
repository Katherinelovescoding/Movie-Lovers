var movieInfo = null;

function getMovie() {
    let searchTerm = document.getElementById('movie-name').value;
    console.log(searchTerm);

    var movieDiv = document.getElementById('movieDiv');
    var table = document.querySelector('#searchResultsTable');
    var posterDivs = document.querySelectorAll('.poster');
    var posterGrid = document.querySelector('.poster-grid');

    movieDiv.innerHTML = '';
    table.innerHTML = '';

    posterGrid.style.display = 'none';

    fetch(`/movies/${searchTerm}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Handle the data here...
            if (data.Response === 'False') {
                movieDiv.innerHTML = 'No movie found';
                movieDiv.style.height = '100px';
                //document.querySelector('.poster-grid').style.display = 'none';
                return;
            }
            movieDiv.innerHTML = movieDiv.innerHTML + `
			<h3>Movies matching: "${searchTerm}" </h3>
			`;
            //document.querySelector('.poster-grid').style.display = 'none';
            movieDiv.style.height = '100px';;
            let movie = data;
            movieInfo = movie;

            let newRow = table.insertRow(-1);

            let cell1 = newRow.insertCell(0);
            let cell2 = newRow.insertCell(1);
            let cell3 = newRow.insertCell(2);
            let cell4 = newRow.insertCell(3);
            let cell5 = newRow.insertCell(4);
            let cell6 = newRow.insertCell(5);

            let title = movie.Title;
            let ratings = movie.Ratings[0].Value;
            let year = movie.Year;
            let director = movie.Director;
            let actors = movie.Actors;
            let poster = movie.Poster;

            let img = document.createElement('img');
            img.src = poster;
            cell1.appendChild(img);

            cell2.innerHTML = title + '<br>' + ratings;
            cell2.style.fontWeight = 'bold';
            cell2.style.fontSize = '20px';
            cell3.innerHTML = year;
            cell3.style.fontSize = '20px';
            cell4.innerHTML = director;
            cell3.style.fontSize = '20px';
            cell5.innerHTML = actors;
            cell6.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                Add to Watchlist
                </button>
                <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton" id="watchlistDropdown">
                <!-- Watchlists will be added here -->
                </ul>
            </div>`;

        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from being submitted normally
    getMovie();
});

document.getElementById('create-new-list').addEventListener('click', function (event) {
    var listName = prompt('Please enter the name of the list');

    if (listName != null) {
        // Make an AJAX request to the server-side route that creates a new list
        fetch('/createNewList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                listName: listName
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                alert("List created successfully!")
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
})

$(document).ready(function () {
    $('[data-bs-toggle="offcanvas"]').click(function () {
        // Clear the offcanvas body
        $('.offcanvas-body').empty();

        // Populate the offcanvas body with watchlists
        $.get('/user/watchlists', function (data) {
            console.log(data);

            data.forEach(function (watchlist) {
                var cID = watchlist.id;
                var listItem = $('<p>').text(watchlist.collection_name);
                var link = $('<div>').append($('<a style="width:200px">').attr('href', '/watchlist/' + cID).addClass('btn btn-light').append(listItem));
                //var link = $('<a>').attr('href', '/watchlist/' + cID).addClass('btn btn-dark').append(listItem);
                $('.offcanvas-body').append(link);
            });

            // Show the offcanvas manually
            var offcanvasElement = document.getElementById('offcanvasWithBothOptions');
            var offcanvas = new bootstrap.Offcanvas(offcanvasElement);
            offcanvas.show();
        });
    });
});

// get the watchlist for "Add to Watchlist" dropdown
$(document).ready(function () {
    // Attach the click event listener to the document
    // It will fire for all descendants of the document that match the '#dropdownMenuButton' selector
    $(document).on('click', '#dropdownMenuButton', function () {
        var dropdownMenu = document.getElementById('watchlistDropdown');
        dropdownMenu.innerHTML = ''; // Clear the dropdown menu

        $.get('/user/watchlists', function (data) {
            console.log(data);

            data.forEach(function (watchlist) {
                var cID = watchlist.id;
                var listItem = $('<li>').append($('<a>').attr('href', '#').attr('id', 'collection-' + cID).addClass('dropdown-item').text(watchlist.collection_name));
                $(dropdownMenu).append(listItem);
            });
        });
    });

    // Add a click event listener to each item in the dropdown menu
    $(document).on('click', '#watchlistDropdown li a', function (event) {
        event.preventDefault(); // Prevent the default action

        var collectionID = this.id.split('-')[1]; // Get the collection_id from the id of the clicked item
        var title = movieInfo.Title;
        var imdb = movieInfo.imdbID;
        var year = movieInfo.Year;
        var poster = movieInfo.Poster;
        var director = movieInfo.Director;

        // Send a POST request to the server with the watchlist and movie information
        $.post('/add_movie_to_watchlist', {
            collectionID: collectionID,
            title: title,
            imdbID: imdb,
            year: year,
            poster: poster,
            director: director
        }, function (response) {
            console.log(response);
        });
    });
});

document.getElementById('admin').addEventListener('click', function () {
    window.location.href = '/users';
});
