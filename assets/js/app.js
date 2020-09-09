<script>
(function() {
    let petAgeArray = [];
    let petTypeArray = [];
    let petFilterTypesArray = [];
    let petFilterSelectedOptions = [];
    let selectedOptions = 0;

    /*
        Check if we have an API access token stored in localStorage, if not
        we pass of to the checkTokenExpiry function to check if it
        has expired - if no API key exists in localStorage, we refresh
        the access token
    */

    if (localStorage.getItem('key') !== null) {
        var apiKey = localStorage.getItem('key');

        checkTokenExpiry(apiKey);
    }

    else {
        refreshAccessToken(apiKey);
    }

    const ul = document.getElementById('app');

    /*
        Fetch data from the PetFinder API
    */

    function fetchData(apiKey) {
        fetch('https://api.petfinder.com/v2/animals?limit=40', {
            headers: {
                authorization: 'Bearer ' + apiKey
            }
        })
            .then((resp) => resp.json())
            .then(function(data) {

                runScript(data);

            }).catch(function(error) {

            console.log(error);

        });
    }

    /*
        Once we have the data, let's do something with it
    */

    function runScript(data) {
        data.animals.map(function(pet) {
            // console.log(pet);
            if (!petAgeArray.includes(pet.age)) {
                petAgeArray.push(pet.age);
            }

            if (!petTypeArray.includes(pet.type)) {
                petTypeArray.push(pet.type);
            }

        });

        /*
            Defines the filter options
        */

        let options = petAgeArray.map((element) => {
            return `<div class="option">${element} <div class="filter-icon"></div></div>`;
        });

        document.querySelector('.pet-age').innerHTML = options.join('');

        let petTypeOptions = petTypeArray.map((element) => {
            return `<div class="option">${element} <div class="filter-icon"></div></div>`;
        });

        document.querySelector('.pet-type').innerHTML = petTypeOptions.join('');

        var htmlOutput = data.animals.map(function(pet) {
            return `
                <li data-age="${pet.age}"
                data-type="${pet.type}">
                <h2>${pet.name}</h2>
                <br/> Age: ${pet.age}
                <br/> Type: ${pet.type}</li>
            `

        });

        ul.innerHTML = htmlOutput.join('');

        let filterType;

        /*
            Describe what is going on here
        */

        [...document.querySelectorAll('.custom-select')].forEach(function(item) {
            item.addEventListener('click', function(e) {
                if (e.target.className === 'custom-select-default') {
                    const child = e.target.parentNode.children[1];
                    filterType = e.target.parentNode.getAttribute('data-filter-type');

                    if (child.style.display == 'none' || child.style.display == '') {
                        child.style.display = 'block';
                    }

                    else {
                        child.style.display = 'none';
                    }
                }

                if (e.target.classList.contains('option')) {
                    var filterSelection = e.target.textContent.trim();
                    var optionBoxes = document.querySelectorAll('.custom-select-options');
                    var options = document.querySelectorAll('.option');

                    optionBoxes.forEach(optionsBox => optionsBox.style.display = 'none');

                    e.target.classList.toggle('filter-active');

                    [...options].forEach((element) => {
                        if (element.classList.contains('filter-active') && !petFilterSelectedOptions.includes(element.textContent.trim())) {
                            petFilterSelectedOptions.push(element.textContent.trim());
                        }
                    });

                    document.querySelector('.selection-text').innerHTML = selectedOptions;

                    changeFilter(filterSelection, filterType);
                }
            });
        });

        /*
            Once we have all of the data from the API, we check to
            see if the selected filter matches any of the li's and if it
            does, we show them and hide the others
       */

        function changeFilter(filterSelection, filterType) {

            var li = document.querySelectorAll('#app li');

            li.forEach(function(listingAges) {
                let dataType = listingAges.getAttribute('data-' + filterType);

                for (let i = 0; i < petFilterSelectedOptions.length; i++) {

                    if (petFilterSelectedOptions[i] !== dataType) {
                        listingAges.style.display = 'none';
                    }

                    else {
                        listingAges.style.display = 'block';
                    }
                }
            });
        }
    }

    /*
        If no API token exists or is older than 1 hour, we
        generate a new one and pass off to fetchData to continue
        the API call
    */

    function refreshAccessToken(apiKey) {
        fetch("https://api.petfinder.com/v2/oauth2/token", {
            body: "grant_type=client_credentials&client_id=Z9mg8TplzPQfmSw0t1eGTllzwsEq2EkRXl9Zx0UKTVLHp1mTfs&client_secret=bCqzBe9Apsc0emaGxLVdLuwbH9A6AryrgYw49LOj",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST"
        })
            .then((resp) => resp.json())
            .then(function(data) {
                apiKey = data.access_token;

                fetchData(apiKey);

                console.log('new api key generated: ' + apiKey);
            });
    }

    /*
        Check to see if we have an API token stored in localStorage
        that hasn't expired (1 hour expiry) - if token is expired or
        not stored, generate a new one and save to localStorage
     */

    function checkTokenExpiry(apiKey) {
        var hours = 1;
        var now = new Date().getTime();
        var setupTime = localStorage.getItem('setupTime');
        if (setupTime == null) {
            refreshAccessToken(apiKey);
            localStorage.setItem('setupTime', now);
        } else if (now-setupTime > hours*60*60*1000) {
            refreshAccessToken(apiKey);
            localStorage.removeItem('setupTime');
            localStorage.setItem('setupTime', now);
        } else {
            fetchData(apiKey);
        }

    }
})();
</script>