(function() {
    let petAgeArray = [];
    let petTypeArray = [];
    let petFilterTypesArray = [];
    let petFilterSelectedOptions = [];
    let selectedOptions = 0;
    let parentFilterType;

    const ul = document.getElementById('app');

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

        /*
            Loop over every filter and get data-filter-type value and store in
            an object, then loop over each .option inside of the filter and add
            those to the object too
         */

        let filterType;

        var listFilterTypes = document.querySelectorAll('.filters .filter');
        var listFilterTypesObj = {};

        for (let i = 0; i < listFilterTypes.length; i++) {

            let allOptions = listFilterTypes[i].querySelectorAll('.option');

        }

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
                    var options = document.querySelectorAll('.option');

                    e.target.classList.toggle('filter-active');

                    if (!petFilterSelectedOptions.includes(filterSelection)) {
                        petFilterSelectedOptions.push(filterSelection);
                    }

                    /*
                        Check how many filter options are selected and update the filter
                        .selection-text to specify the number of selections a user has
                        made on that specific filter
                     */

                    for (var i = 0; i < options.length; i++) {

                        if (options[i].classList.contains('filter-active') && !petFilterSelectedOptions.includes(filterSelection)) {
                            petFilterSelectedOptions.push(filterSelection);
                            break;
                        }

                        else if (!options[i].classList.contains('filter-active') && petFilterSelectedOptions.includes(filterSelection)) {
                            //.splice(petFilterSelectedOptions.indexOf(filterSelection), 1);
                            break;
                        }

                    }

                    setSelectionValue();
                    changeFilter(petFilterSelectedOptions);

                }
            });
        });

        /*
            When the filters are cleared, we remove all of the 'filter-active'
            classes from any selected filter options. We also reset the
            petFilterSelectedOptions object
         */

        document.querySelector('.custom-select').addEventListener('click', function(e) {
            if (e.target.className === 'clear-filters') {

                let li = [...document.querySelectorAll('#app li')];

                li.map(element => element.style.display = 'block');

                const options = [...this.querySelectorAll('.option')];
                const selectionHtml = document.querySelector('.selection-text');

                var toHide = options.map(function(element) {
                    return element.classList.remove('filter-active');
                });

                petFilterSelectedOptions = [];

                setSelectionValue();
            }
        });

        /*
            When we select a filter option or we clear the filter,
            we set the value of the default text in the dropdown to
            show the user how many selections they have made, per filter
         */

        const setSelectionValue = function() {
            const selectionHtml = document.querySelector('.selection-text');

            if (petFilterSelectedOptions.length === 0) {
                selectionHtml.innerHTML = 'Any';
            } else if (petFilterSelectedOptions.length === 1) {
                selectionHtml.innerHTML = petFilterSelectedOptions.length + ' Selection';
            } else {
                selectionHtml.innerHTML = petFilterSelectedOptions.length + ' Selections';
            }
        }
    }

    /*
        Once we have all of the data from the API, we check to
        see if the selected filter matches any of the li's and if it
        does, we show them and hide the others
    */

    function changeFilter(petFilterSelectedOptions, filterType) {

        let li = [...document.querySelectorAll('#app li')];

        li.map(function(element) {

            var elementAttributes = [];

            elementAttributes.push(element.dataset.age);
            elementAttributes.push(element.dataset.type);

            petFilterSelectedOptions.map((element2) => {

                let [ age, type ] = elementAttributes;

                if (elementAttributes.indexOf(element2) !== -1) {
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            });
        });
    }

    /*
        Check if the filter options are displaying, if they are
        then hide on next click
     */

    document.querySelector('body').addEventListener('click', checkFilterVisibility);

    function checkFilterVisibility(e) {

        const options = [...document.querySelectorAll('.custom-select-options')];

        options.map((element) => {
            if (element.style.display === 'block' && e.target.className !== 'custom-select-default') {
                element.style.display = 'none';
            }
        });
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

                localStorage.setItem('key', apiKey)

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