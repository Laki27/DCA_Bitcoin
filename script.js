var podaci = [0.6901, 0.1221, 0.2752, 0.4895, 0.1745, 0.2537, 0.2145, 0.0745, 0.0637, 0.0469, 0.1042, 0.1346, 0.0802, 0.0581, 0.0341]
var probni = [0.6901, 0.1221, 0.2752, 0.4895, 0.1745, 0.2537, 0.2145, 0.0745, 0.0637, 0.0469, 0.1042, 0.1346, 0.0802, 0.0581, 0.0341]
var kvartali=['JUN2017', 'DEC2017', 'JUN2018', 'DEC2018', 'JUN2019', 'DEC2019', 'JUN2020', 'DEC2020', 'JUN2021', 'DEC2021', 'JUN2022', 'DEC2022', 'JUN2023', 'DEC2023', 'MART2024'];

var datumi =[];
var cene = [];

/////////////////////////////////////////////////////////////////////////////////////////////
var trenutna_cena_float=0;
async function currentValue() {
var burl = 'https://api.binance.com/api/v3/ticker/price?symbol='
var symbol = 'BTCUSDT'
var url = burl + symbol
var ourRequest = new XMLHttpRequest()
trenutna_cena_float=0;
ourRequest.open('GET', url, true)
ourRequest.onload = function() {
  console.log(ourRequest.responseText)
  var response = JSON.parse(ourRequest.responseText);
  const trenutna_cena=document.getElementById('trenutnaCena');
  trenutna_cena_float = parseFloat(response.price).toFixed(2);
  trenutna_cena.innerHTML=trenutna_cena_float
}
ourRequest.send()};
currentValue();
setInterval(currentValue, 60000);
/////////////////////////////////////////////////////////////////////////
var burl = 'https://api.binance.com/api/v3/klines';
var symbol = 'BTCUSDT';
var interval = '1d';

function getDateArray(startDate, period){
    var dates =[];
    var currentDate = new Date(startDate); 

    while(currentDate <= new Date()){
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate()+period);
    }
    return dates
} // vraca NIZ datuma

var dates;
var dates_str=[];

function getUnixTimestamp(date){
    return Math.floor(date.getTime()/1000)*1000;
}

async function getPirceForDate(date) { //2 
    var timestamp = getUnixTimestamp(date); //3
    var url = `${burl}?symbol=${symbol}&interval=${interval}&startTime=${timestamp}&limit=1`;

    try{
        const response = await fetch(url);
        const data = await response.json();
        if(data.length > 0){
            const closePrice = data[0][4];
            return closePrice;
        }
        return null;
    } catch (err){
        console.error('Error fetching data:', err);
        return null;
    }   
}

var myChart
var canvas = document.getElementById('myChart')
var prices=[]
var kupljeno=0;
var paragraf = document.getElementById('paragraf');
console.log(paragraf)
async function getPriceFromStartDate(br_iteracija){ //1
    prices=[];
    let i=0;
    for (i=0; i<br_iteracija; i++){
        var price = await getPirceForDate(dates[i]); //2 za svaki datum cena
        prices.push(price);
        kupljeno+=100/price;
        paragraf.textContent=`UCITANO: ${i+1}/${br_iteracija}`
    }
    paragraf.textContent=`Bought ${kupljeno.toFixed(8)} for ${br_iteracija*100}$ now worth ${(kupljeno*trenutna_cena_float).toFixed(2)}`;
    var ctx = canvas.getContext('2d');
    myChart = new Chart(ctx, {
    type: 'line',  // Tip grafikona (može biti 'bar', 'line', 'pie', itd.)
    data: {
        labels: dates_str ,  // X-os
        datasets: [{
            label: 'PRICE in $',  // Naslov podataka
            data: prices,  // Podaci za grafikon (Y-os)
            backgroundColor: 'rgba(75, 192, 192, 0.2)',  // Boja ispunjenja
            borderColor: 'rgba(75, 192, 192, 1)',  // Boja linije
            borderWidth: 2  // Debljina linije
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: false  // Postavljanje početne vrednosti Y-ose na 0
            }
        }
    }
    });

    
}

const period = document.getElementById('period');
function readDate(){ //nakon sto se klikne
    if(myChart){
        myChart.destroy();
        dates=[];
        dates_str=[];
        console.log("UNISTIO SAM")
    }
    const dateInput = document.getElementById('datum');
    console.log(typeof(period.value))
    dates = getDateArray(dateInput.value, parseInt(period.value)); // nizDatuma
    for (let date of dates){
        dates_str.push(date.toDateString().substring(3, date.toDateString().length)) //niz labela
    }
    
    getPriceFromStartDate(dates.length); //1 pocinjemo crtanje za niz datuma
}

var canvas2
var myChart2
canvas2 = document.getElementById('yourChart')
var ctx2 = canvas2.getContext('2d');
myChart2 = new Chart(ctx2, {
    type: 'line',  // Tip grafikona (može biti 'bar', 'line', 'pie', itd.)
    data: {
        labels: kvartali ,  // X-os
        datasets: [{
            label: 'm2/BTC',  // Naslov podataka
            data: podaci,  // Podaci za grafikon (Y-os)
            backgroundColor: 'rgba(75, 192, 192, 0.2)',  // Boja ispunjenja
            borderColor: 'rgba(75, 192, 192, 1)',  // Boja linije
            borderWidth: 2  // Debljina linije
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: false  // Postavljanje početne vrednosti Y-ose na 0
            }
        }
    }
});

const levi_selektor = document.getElementById('prvi');
const desni_selektor = document.getElementById('drugi');
levi_selektor.addEventListener('click', function(){
    levi_selektor.style.border = '2px solid purple';
    desni_selektor.style.border = '';
    canvas.style.display = 'block';
    canvas2.style.display='none';
    if(!myChart){
        paragraf.textContent='Buy for 100$ each time';
    } else {
        paragraf.textContent=`Bought ${kupljeno.toFixed(8)} for ${dates.length*100}$ now worth ${(kupljeno*trenutna_cena_float).toFixed(2)}`;
    }
})

desni_selektor.addEventListener('click', function(){
    desni_selektor.style.border = '2px solid purple';
    levi_selektor.style.border = '';
    canvas2.style.display = 'block';
    canvas.style.display='none';
    paragraf.textContent='The average price of m2 in Belgrade by the quarters in BTC';
})