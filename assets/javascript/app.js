// Initialize Firebase
var config = {
    apiKey: "AIzaSyByHE6qwHHiQAMtKw8SYW4JoZESNytX2II",
    authDomain: "train-scheduler-dd5a2.firebaseapp.com",
    databaseURL: "https://train-scheduler-dd5a2.firebaseio.com",
    projectId: "train-scheduler-dd5a2",
    storageBucket: "train-scheduler-dd5a2.appspot.com",
    messagingSenderId: "402291686823"
};
firebase.initializeApp(config);

var database = firebase.database();

function googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)

        .then(result => {
            const user = result.user;
            $('.jumbotron').append(`Hello ${user.displayName}`);
            console.log(user);
            
        })
        .catch(console.log);
}

function appendTableRow(name, destination, frequency, nextTrain, minsAway, key) {
    var newTableRow = $('<tr>')
        .append($('<td>').text(name))
        .append($('<td>').text(destination))
        .append($('<td>').text(frequency))
        .append($('<td>').text(nextTrain))
        .append($('<td>').text(minsAway))
        .append($('<td>').html('<span class="oi oi-reload reload-icon" title="reload" aria-hidden="true" data-key="' + key + '"></span>'))
        .append($('<td>').html('<span class="oi oi-x delete-icon" data-key="' + key + '"></span>'));

    $('#trains').append(newTableRow);
}

function calculateTime(firstTrain, frequency) {
    var newFormat = 'HH:mm';
    //var currentTime = moment().format(newFormat);
    //console.log(currentTime);
    // substracts one year so ints in the past
    firstTrain = moment(firstTrain, newFormat).subtract(1, 'years');
    console.log('first train : ' + firstTrain);
    // Difference of between current time and first train in minutes
    var diffTime = moment().diff(moment(firstTrain), 'minutes');
    console.log('diff in time : ' + diffTime);
    // Remaing time
    var tRemainder = diffTime % frequency;
    console.log(tRemainder);
    // Mins Away is the frequency of the train minus the remainder
    var minsAway = frequency - tRemainder;
    console.log(minsAway);
    //Calculates the next train and displays it in HH:mm
    var nextTrain = moment().add(minsAway, 'minutes');
    nextTrain = moment(nextTrain).format(newFormat)
    console.log('nextr train: ' + nextTrain);
    //Returns two vars
    return [nextTrain, minsAway];
}

$(document).ready(function () {
    $('#myform').submit(function (event) {
        event.preventDefault();
        name = $('#train-name').val().trim();
        destination = $('#destination').val().trim();
        firstTrain = $('#first-train').val().trim();
        frequency = $('#frequency').val().trim();
        database.ref().push({
            name: name,
            destination: destination,
            firstTrain: firstTrain,
            frequency: frequency
        })
        $('input').val('');
    })

    database.ref().on('child_added', function (snap) {
        var name = snap.val().name;
        var destination = snap.val().destination;
        var firstTrain = snap.val().firstTrain;
        var frequency = snap.val().frequency;
        var key = snap.key;
        console.log(firstTrain);

        //MomentJS Calcs
        var time = calculateTime(firstTrain, frequency);
        // Returned values from the fuction
        var nextTrain = time[0];
        var minsAway = time[1];

        appendTableRow(name, destination, frequency, nextTrain, minsAway, key);
    })
    //Not Working
    $(document).on('click', '.reload-icon', function () {
        // I need to know when clicked what firebase entry i'm selecting
        //so i can assign variables an recalculate time
        key = $(this).attr('data-key');
        //Not getting the value
        ref = database.ref().child(key);
        console.log(ref);

        firstTrain = database.ref().child(key).firstTrain;
        frequency = database.ref().child(key).frequency;
        console.log(firstTrain + ' ' + frequency);

        time = calculateTime(firstTrain, frequency);
        nextTrain = time[0];
        minsAway = time[1];

        console.log('refresh time');
    })

    $(document).on('click', '.delete-icon', function () {
        key = $(this).attr('data-key');
        console.log(key);
        database.ref().child(key).remove();
        window.location.reload()
    })


})

setInterval(function () {
    $('#trains').empty();
    database.ref().on('child_added', function (snap) {
        var name = snap.val().name;
        var destination = snap.val().destination;
        var firstTrain = snap.val().firstTrain;
        var frequency = snap.val().frequency;
        var key = snap.key;
        console.log(firstTrain);

        //MomentJS Calcs
        var time = calculateTime(firstTrain, frequency);
        // Returned values from the fuction
        var nextTrain = time[0];
        var minsAway = time[1];

        appendTableRow(name, destination, frequency, nextTrain, minsAway, key);
    })
    console.log('timers up');

}, 60000)