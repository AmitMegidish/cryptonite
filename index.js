//================================================= Global variables ===============================================//
const mainContainer = $('#main-container');
const NavigationBar = $('#main-nav');

// Array of coins from API's first Endpoint
let coinsArr = [];

// Array of coins that will be seen on the live reports
let toggledArr = [];


// Search input for a specific currency
const coinSearch = `
    <nav id="search-wraper" class="navbar navbar-light ">
        <form class="form-inline">
             <input id='coin-search' class="form-control mr-sm-2" type="search" autocomplete ="off"
              placeholder="Search Coin by Symbol" aria-label="Search">
        </form>
    </nav>
    `;
// Spinner 
const spinner = `
    <div class="spinner-border" style="width: 10rem; height: 10rem;" role="status">
         <span class="sr-only">Loading...</span>
    </div>
    `;

// Modal handling Variables
let clickedIndex = -1;
let isModalListClicked = false;

// Dynamicly changes the title of the document.
let dynamicCounter = 0;
function dynamicTitle() {
    const titleArr = ['C', 'Cr', 'Cry', 'Cryp', 'Crypt', 'Crypto', 'Crypton', 'Cryptoni', 'Cryptonit', 'Cryptonite'];
    document.title = titleArr[dynamicCounter % titleArr.length];
    dynamicCounter++;
    let timer = setTimeout(dynamicTitle, 250);
    if (dynamicCounter > titleArr.length - 1) {
        clearTimeout(timer);
    }
};

// ========================================================== Home Page =========================================================== //
window.onload = () => {
    dynamicTitle();
    createHomePage();
};

function createHomePage() {
    mainContainer.empty();
    $('#search-wraper').remove();
    NavigationBar.append(coinSearch);
    mainContainer.append(spinner);

    $.get(`https://api.coingecko.com/api/v3/coins/list`, data => {
        mainContainer.empty();
        $('#coin-search').keyup(e => {
            e.preventDefault();
            searchCoin();
        });
        coinsArr = data;
        for (let i = 0; i < 100; i++) {
            coinCards(i);
        }
    });
};

// Visual creation of a bootstrap card, for each currency that has been obtained via API
function coinCards(i) {
    const coin = coinsArr[i];
    const btnId = 'btn' + i;
    const collapseId = 'coll' + i;
    const liveReportsSwitch = 'customSwitch' + i;
    const collapseContentId = 'content' + i;
    const singleCard = `
    <div class="card col-xl-2 col-lg-3 col-md-4 col-sm-5 col-xs-6"  id="${coin.id}>
         <div class="card-body">
             <div class="custom-control custom-switch">
                  <input type="checkbox" class="custom-control-input" id="${liveReportsSwitch}">
                 <label class="custom-control-label" for="${liveReportsSwitch}">Live status</label>
             </div>
             <h4 class="card-title" style= "text-align: center; font-weight: bold">${coin.id}</h4>
             <p class="card-text">Name: ${coin.name}</p>
             <p class="card-text">Symbol: ${coin.symbol}</p>
             <button id='${btnId}' class="btn btn-primary mx-auto" type="button" data-toggle="collapse" data-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                More info
             </button>
             <div class="collapse" id="${collapseId}">
                 <div id= ${collapseContentId} class="card card-body"></div>
            </div>
        </div>
    </div>
    `;

    mainContainer.append(singleCard);

    if (isInReports(coin)) {
        $(`#${liveReportsSwitch}`).prop("checked", true);
    }


    // Attaching event listeners to relevant elements.
    $('#' + btnId).click(() => coinMoreInfo(i));
    $('#customSwitch' + i).click(() => {
        if ($('#customSwitch' + i).prop('checked')) {
            addToReports(coin, i);
        } else if (!$('#customSwitch' + i).prop('checked')) {
            removeFromReports(coin);
        }
    });
};

function resetArrays() {
    liveCoinName = [];
    liveCoin1 = [];
    liveCoin2 = [];
    liveCoin3 = [];
    liveCoin4 = [];
    liveCoin5 = [];
}

$('#home').click(e => {
    clearInterval(intervalAsVar);
    homePageViaNav(e);
    resetArrays();
});

$('#brand-name').click(e => {
    clearInterval(intervalAsVar);
    homePageViaNav(e);
    resetArrays();
});

function homePageViaNav(e) {
    e.preventDefault();
    $('#about').removeClass('active');
    $('#live-reports').removeClass('active');
    $('#home').addClass('active');
    createHomePage();
};

function coinMoreInfo(i) {
    const collapseContentId = 'content' + i;
    const spinner = `
     <div class="spinner-border mx-auto" role="status">
        <span class="sr-only">Loading...</span>
     </div>`;

    $('#' + collapseContentId).html(spinner);

    if (sessionStorage.getItem(coinsArr[i].id.toString())) {
        const data = JSON.parse(sessionStorage.getItem(coinsArr[i].id.toString()));
        const now = new Date();
        let dataTimeStamp = new Date(data.timeStamp);
        dataTimeStamp.setMinutes(dataTimeStamp.getMinutes() + 2)
        if (now.getTime() > dataTimeStamp.getTime()) {
            coinInfoAPI(i);
        } else {
            setCoinInfoHTML(data.content, collapseContentId);
        }
    } else {
        coinInfoAPI(i);
    }
};

function coinInfoAPI(i) {
    const collapseContentId = 'content' + i;
    $.get(`https://api.coingecko.com/api/v3/coins/${coinsArr[i].id}`, data => {
        sessionStorage.setItem(coinsArr[i].id.toString(), JSON.stringify({ content: data, timeStamp: new Date() }));
        setCoinInfoHTML(data, collapseContentId);
    });
}

function setCoinInfoHTML(data, collapseContentId) {
    const infoHTML = `
        <img  class = "mx-auto" src=${data.image.large} width='70px' alt=" coin image" srcset="">
        <p class="card-text" >$ ${data.market_data.current_price.usd ? data.market_data.current_price.usd : 'Not Available'}</p>
        <p class="card-text" >€ ${data.market_data.current_price.eur ? data.market_data.current_price.eur : 'Not Available'}</p>
        <p class="card-text" >₪ ${data.market_data.current_price.ils ? data.market_data.current_price.ils : 'Not Available'}</p>
    `;
    $('#' + collapseContentId).html(infoHTML);
}

function addToReports(coin, i) {
    if (toggledArr.length < 5) {
        toggledArr.push(coin);
    } else {
        clickedIndex = i;
        handleModal(i);
    }
}

function removeFromReports(coin) {
    toggledArr = toggledArr.filter(coins => coins.id !== coin.id);
}

function isInReports(coin) {
    const toggledCoin = toggledArr.find(arrCoin => arrCoin.id === coin.id);
    if (toggledCoin) {
        return true;
    }
    return false;
}

function toggler(i) {
    const liveReportsSwitch = 'customSwitch' + i;
    $(`#${liveReportsSwitch}`).prop("checked", !$(`#${liveReportsSwitch}`).prop("checked"));
}

function handleModal(i) {
    const modal = `
    <div class="modal fade" id="my-modal" tabindex="-1" role="dialog" aria-labelledby="my-modal" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLongTitle"> You may select up to 5 coins. please, select a coin to be removed, or instead hit the close button to remove the last coin you selected</h5>
      </div>
      <div class="modal-body">
      <button type="button" class="list-group-item list-group-item-action" data-dismiss="modal">${toggledArr[1].name}</button>
      <button type="button" class="list-group-item list-group-item-action" data-dismiss="modal">${toggledArr[0].name}</button>
      <button type="button" class="list-group-item list-group-item-action" data-dismiss="modal">${toggledArr[2].name}</button>
      <button type="button" class="list-group-item list-group-item-action" data-dismiss="modal">${toggledArr[3].name}</button>
      <button type="button" class="list-group-item list-group-item-action" data-dismiss="modal">${toggledArr[4].name}</button> 
      </div>
      <div class="modal-footer">
        <button type="button" class="close-modal btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
    `;
    $(modal).modal('show');
}

$(document).on('click', '.list-group-item', e => {
    isModalListClicked = true;
    const index = coinsArr.findIndex(arrCoin => arrCoin.name === e.target.textContent);
    e.preventDefault();
    removeFromReports(coinsArr[index]);
    if (index > -1) {
        toggler(index);
    }
    toggledArr.push(coinsArr[clickedIndex]);
});

$(document).on('hidden.bs.modal', '#my-modal', function (e) {
    if (!isModalListClicked) {
        toggler(clickedIndex);
    }
    isModalListClicked = false;
})

function searchCoin() {
    let searchStr = $('#coin-search').val().toString();
    if (searchStr !== '') {
        mainContainer.empty();
        for (let i = 0; i < coinsArr.length; i++) {
            if (coinsArr[i].symbol === searchStr) {
                coinCards(i);
            }
        }
    } else if (searchStr === '') {
        for (let i = 0; i < 100; i++) {
            coinCards(i);
        }
    }
};

// ======================================================About Page====================================================== //

$('#about').click(e => {
    e.preventDefault();
    clearInterval(intervalAsVar)
    resetArrays();
    const pageContent = `
    <div id='about-container' class='container'>
        <h1 id='about-heading'> About</h1>
        <p class='about-description'>
            Cryptonite is a website dedicated to the world of virtual currency.   
        </p> 
        <p class='about-description'>
            Cryptonite displays information for all existing virtual currencies out there, and, if 
            available, has the ability to present a self-updating Line Chart, that displays 
            the exchange rates of a selected currency (up to 5 currencies at a time).
        </p>         
        <p class='about-description'>
        Cryptonite was developed by Amit Megidish - An aspiring Full Stack developer, as 
        part of JOHN BRYCE's Full Stack web development course.
        </p>
        <div id='profile-pic'></div>
    </div>
    `;
    mainContainer.empty();
    $('#about').addClass('active');
    $('#home').removeClass('active');
    $('#live-reports').removeClass('active');
    $('#search-wraper').remove();
    mainContainer.append(pageContent);
});

// ================================================== Live Reports ================================================== //
const reportsCont = `<div id="chartContainer" style="height: 370px; width: 100%; margin-top: auto ;"></div>`;

// Arrays of data for chart
let intervalAsVar;
let liveCoinName;
let liveCoin1 = [];
let liveCoin2 = [];
let liveCoin3 = [];
let liveCoin4 = [];
let liveCoin5 = [];

$('#live-reports').click((e) => {
    e.preventDefault()
    mainContainer.empty();
    clearInterval(intervalAsVar);
    resetArrays();
    mainContainer.append(spinner);
    mainContainer.html(reportsCont);
    $('#live-reports').addClass('active');
    $('#home').removeClass('active');
    $('#about').removeClass('active');
    $('#search-wraper').remove();
    displayChart(e);
    intervalAsVar = setInterval(() => {
        displayChart();
    }, 2000);
});

// Creation and presentation of the chart
function displayChart(e) {
    $.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${toggledArr.map(coin => coin.symbol)}&tsyms=USD`, data => {
        let now = new Date();
        let dataCounter = 1;
        liveCoinName = [];

        for (let key in data) {
            if (dataCounter === 1) {
                liveCoin1.push({ x: now, y: data[key].USD });
                liveCoinName.push(key);
            }
            if (dataCounter == 2) {
                liveCoin2.push({ x: now, y: data[key].USD });
                liveCoinName.push(key);
            }

            if (dataCounter == 3) {
                liveCoin3.push({ x: now, y: data[key].USD });
                liveCoinName.push(key);
            }

            if (dataCounter == 4) {
                liveCoin4.push({ x: now, y: data[key].USD });
                liveCoinName.push(key);
            }

            if (dataCounter == 5) {
                liveCoin5.push({ x: now, y: data[key].USD });
                liveCoinName.push(key);
            }
            dataCounter++;
        }
        createGraph();
    })

    function createGraph() {

        let chart = new CanvasJS.Chart("chartContainer", {
            animationEnabled: false,
            title: {
                text: "Exchange rates in $USD"
            },
            axisX: {
                valueFormatString: "hh:mm:ss",
            },
            axisY: {
                title: "Rate",
                suffix: "$",
                titleFontColor: "black",
                lineColor: "black",
                labelFontColor: "black",
                tickColor: "black",
                includeZero: true,
            },
            toolTip: {
                shared: false
            },
            legend: {
                cursor: "pointer",
                itemclick: toggleDataSeries,
            },
            data: [{
                type: "spline",
                name: liveCoinName[0],
                showInLegend: true,
                xValueFormatString: `hh:mm:ss`,
                dataPoints: liveCoin1

            },
            {
                type: "spline",
                name: liveCoinName[1],
                showInLegend: true,
                xValueFormatString: "hh:mm:ss",
                dataPoints: liveCoin2

            },
            {
                type: "spline",
                name: liveCoinName[2],
                showInLegend: true,
                xValueFormatString: "hh:mm:ss",
                dataPoints: liveCoin3

            },
            {
                type: "spline",
                name: liveCoinName[3],
                showInLegend: true,
                xValueFormatString: "hh:mm:ss",
                dataPoints: liveCoin4

            },
            {
                type: "spline",
                name: liveCoinName[4],
                showInLegend: true,
                xValueFormatString: "HH:mm:ss",
                dataPoints: liveCoin5

            }]
        });

        chart.render();

        function toggleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            }
            else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }
    }
}





