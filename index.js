/*-----------------------------------------------------
  REQUIRE
-------------------------------------------------------*/
var yo       = require('yo-yo')
var csjs     = require('csjs-inject')
var minixhr  = require('minixhr')
var chart    = require('chart.js')

/*-----------------------------------------------------
  THEME
-------------------------------------------------------*/
var font       = 'Kaushan Script, cursive'
var font1      = 'Rancho, cursive'
var yellow     = 'hsla(52,35%,63%,1)'
var violet     = 'hsla(329,25%,45%,1)'
var lightBrown = 'hsla(29,21%,67%,1)'
var darkBrown  = 'hsla(13,19%,45%,1)'

var white      = 'hsla(120,24%,96%,1)'
var acajou     =  'hsla(2,29%,27%,1)'
var ruby		   =  'hsla(350,60%,30%,1)'
var rose       =  'hsla(350,37%,48%,1)'
var grullo     =  'hsla(28,18%,57%,1)'

/*-----------------------------------------------------------------------------
  LOADING FONT
-----------------------------------------------------------------------------*/
var links = ['https://fonts.googleapis.com/css?family=Kaushan+Script',                  						'https://fonts.googleapis.com/css?family=Rancho']
var font = yo`<link href=${links[0]} rel='stylesheet' type='text/css'>`
var font1 = yo`<link href=${links[1]} rel="stylesheet">`
document.head.appendChild(font1)

/*-----------------------------------------------------------------------------
LOADING DATA
-----------------------------------------------------------------------------*/
var questions = [
`
Statement #1:
The next social network I build,
will definitely be for cats.
`,
`
Statement #2:
I believe dogs should be allowed
everywhere people are
`,
`
Statement #3:
My friends say, my middle name should be "Meow".
`,
`
Statement #4:
Snoop Dog is definitely one of my
favourite artists
`,
`
Statement #5:
I think I could spend all day just
watching cat videows
`,
`
Statement #6:
I regularly stop people in the street
to pet their dogs.
`
]
var i               = 0
var question        = questions[i]
var results         = []
var answerOptions   = [1,2,3,4,5, 6]

/*-----------------------------------------------------------------------------
  QUIZ
-----------------------------------------------------------------------------*/
function quizComponent () {
  var css = csjs`
    .quiz {
      background-color: ${grullo};
      text-align: center;
      font-family: 'Rancho', cursive;
      padding-bottom: 200px;
    }
    .welcome {
      font-size: 6em;
      padding: 60px;
      color: ${acajou}
    }
    .question {
      font-size: 3em;
      color: ${white};
      padding: 40px;
      margin: 0 5%;
    }
    .answers {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      margin: 0 5%;
    }
    .answer {
      background-color: ${ruby};
      padding: 15px;
      margin: 5px;
      //border: 2px solid ${white};
      border-radius: 50%;
    }
    .answer:hover {
      background-color: ${rose};
      cursor: pointer;
    }
    .instruction {
      color: ${ruby};
      font-size: 2em;
      margin: 0 15%;
      padding: 20px;
    }
    .results {
      background-color: ${grullo};
      text-align: center;
      font-family: 'Rancho', cursive;
      padding-bottom: 200px;
    }
    .resultTitle{
      font-size: 5em;
      padding: 50px 50px 20px;
      color: ${acajou}
    }
    .back {
      margin-top: 50px;
      display: flex;
      justify-content: center;
    }
    .backImg {
      height: 25px;
      padding: 5px;
    }
    .backImg:hover {
      cursor: pointer;
    }
    .backText {
      margin-top: 2px;
      color: ${white};
      font-size: 25px;
    }
    .backText:hover {
      cursor: pointer;
    }
    .showChart {
      font-size: 2em;
      color: ${ruby};
      margin:10px 20px 20px;
    }
    .showChart:hover {
      color: ${rose};
      cursor: pointer;
    }
    .myChart {
      width: 300px;
      height: 300px;
    }
`

     function template () {
    return yo`
      <div class="${css.quiz}">
        <div class="${css.welcome}">
          Welcome to my quiz!
        </div>
        <div class="${css.question}">
          ${question}
        </div>
        <div class="${css.answers}">
          ${answerOptions.map(x=>yo`<div class="${css.answer}"
            onclick=${nextQuestion(x)}>${x}</div>`)}
        </div>
        <div class="${css.instruction}">
          Choose how strongly do you agree with the statement<br>
          (1 - don't agree at all, 6 - completely agree)
        </div>
        <div class="${css.back}" onclick=${back}>
           <img src="http://i.imgur.com/L6kXXEi.png" class="${css.backImg}">
           <div class="${css.backText}">Back</div>
        </div>
      </div>
    `
  }
  var element = template()
  document.body.appendChild(element)

  return element

  function nextQuestion(id) {
  return function () {
    if (i < (questions.length-1)) {
      console.log('Index=', i)
      console.log('Answer Id=', id)
      console.log('Results=', results)
      results[i] = id
      console.log('Results=', results)
      i = i+1
      console.log('Index=', i)
      question = questions[i]
       console.log('Question=', question)
      yo.update(element, template())
    } else {
      results[i] = id
      sendData(results)
      yo.update(element, seeResults(results))
      }
   }
 }
  function seeResults(data) {
  var ctx = yo`<canvas class="${css.myChart}"></canvas>`
  return yo`
    <div class="${css.results}">
      <div class="${css.resultTitle}">
        Compare your answers
      </div>
      <div class="${css.showChart}"onclick=${function(){createChart(ctx, data)}}>
        Click to see the chart
      </div>
       ${ctx}
    </div>
  `
	}

  function back() {
    if (i > 0) {
      i = i-1
      question = questions[i]
      yo.update(element, template())
    }
  }

  function sendData(results) {
      var request  = {
        url          : 'https://quiz-3249c.firebaseio.com/results.json',
        method       : 'POST',
        data         : JSON.stringify(results)
      }
      minixhr(request)
  }

  function createChart(ctx, myData) {
    minixhr('https://quiz-3249c.firebaseio.com/results.json', responseHandler)
    function responseHandler (data, response, xhr, header) {
      var data = JSON.parse(data)
      var keys = Object.keys(data)
      var arrayOfAnswers = keys.map(x=>data[x])
      var stats = arrayOfAnswers.reduce(function(currentResult,answer,i) {
        var newResult=currentResult.map((x,count)=>(x*(i+1)+answer[count])/(i+2))
        return newResult
      }, myData)
      var data = {
        labels: [
          "Statement #1", "Statement #2", "Statement #3",
          "Statement #4", "Statement #5", "Statement #6"
        ],
        datasets: [
          {
            label: "My statments",
            backgroundColor: "rgba(52, 173, 161, 0.2)",
            borderColor: "rgba(52, 173, 161, 0.9)",
            pointBackgroundColor: "rgba(52, 173, 161, 0.9)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(52, 173, 161, 0.9)",
            data: myData
          },
          {
            label: "Others statements",
            backgroundColor: "rgba(173, 52, 64, 0.2)",
            borderColor: "rgba(173, 52, 64, 0.9)",
            pointBackgroundColor: "rgba(173, 52, 64, 0.9))",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(173, 52, 64, 0.9)",
            data: stats
          }
        ]
      }
      var myChart = new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
          scale: {
            scale: [1,2,3,4,5,6],
            ticks: {
              beginAtZero: true
            }
          }
        }
      })
    }
  }

}
quizComponent()
