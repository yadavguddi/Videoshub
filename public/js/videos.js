document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    var searchQuery = document.getElementById('searchInput').value; // Get the value from the input field

    // Send the search query to your app.js file using AJAX
    // Example using Fetch API
    fetch('/search?query=' + encodeURIComponent(searchQuery))
        .then(response => {
            // Handle the response as needed

            // Reload the page after the search query has been processed
            window.location.reload();
        })
        .catch(error => {
            // Handle errors
        });
});