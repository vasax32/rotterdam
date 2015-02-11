var app = angular.module('mgcrea.ngStrapDocs', ['ngAnimate', 'ngSanitize', 'mgcrea.ngStrap']);

angular.module('mgcrea.ngStrapDocs');

app.controller('time_tab_controller', function($scope, $http, $timeout) {

    $scope.overNight = {}; $scope.overNight.start = {}; $scope.overNight.end = {};

    $scope.overNight.start.date = DateConverter.convertDateToString(new Date());
//    $scope.overNight.start.date = "03.02.2015";
    $scope.overNight.start.time = DateConverter.convertTimeToString(new Date());
//    $scope.overNight.start.time = "14:20";

    $scope.overNight.end.time = DateConverter.convertTimeToString(new Date());
//    $scope.overNight.end.time = "20:33";

    $scope.overNightSave = function(){
        var days = $scope.days;
        var startDayI, endDayI;
        for(var dayI in days){
            var day = days[dayI];
            if(day.date == $scope.overNight.start.date)
                startDayI = dayI;
        }
        endDayI = (parseInt(startDayI) + 1) + "";
        $scope.days[startDayI].workHours.push({
                startWorkingTime: $scope.overNight.start.time,
                endWorkingTime: "23:59",
                restTime: "",
                dayType : '0'
            }
        );
        $scope.days[endDayI].workHours.push({
                startWorkingTime: "00:00",
                endWorkingTime: $scope.overNight.end.time,
                restTime: "",
                dayType : '0'
            }
        );
        console.log($scope.days);
        $scope.clearWorkHours(startDayI);
        $scope.rowChanged(startDayI);
        $scope.clearWorkHours(endDayI);
        $scope.rowChanged(endDayI);
        $('#modal_close').click();
    };

    $scope.clearWorkHours = function(dayIndex){
          var day = $scope.days[dayIndex];
        for(var whI in day.workHours){
            var wh = day.workHours[whI];
            if((wh.startWorkingTime == "00:00" || wh.startWorkingTime == "" )
                && (wh.endWorkingTime == "00:00" || wh.endWorkingTime == "" )
                && (wh.restTime == "0" || wh.restTime == "" )){
                day.workHours.splice(whI, 1);
            }
        }
    };

    $scope.dayTypes = [
        {val: '0', description: 'Werkdag'},
        {val: '1', description: 'Weekenddag'},
        {val: '2', description: 'Wachtdag'},
        {val: '3', description: 'Ziektedag'},
        {val: '4', description: 'Vakantiedag'},
        {val: '5', description: 'ATV-dag'},
        {val: '6', description: 'Betaald verlof'},
        {val: '7', description: 'Ontbetaald verlof'},
        {val: '8', description: 'Tijd-voor-tijd'},
        {val: '9', description: 'Overstaandag'},
        {val: '10', description: 'Zwangerschapsverlof'},
        {val: '11', description: 'Feestdag'},
        {val: '12', description: 'Geen werkdag'}
    ];

    $scope.weekTitles = ["Monday", "Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

    $scope.selectedDate = DateConverter.convertDateToString(new Date());
//    $scope.selectedDate = "01.02.2015";

    $scope.active = true;

    $scope.daysTotalTime = [];

    $scope.timeForTime = 0;

    $scope.totalMonFri =  {h : 0, m : 0};

    $scope.overTime =  {h : 0, m : 0};

    $scope.applyDate = function(){
        var formattedDate = $scope.selectedDate;

        $http.get('api/timeTab', {params : {date : formattedDate}}).then(function(res){
            switch (res.status){
                case 200 :
                {
                    $scope.days = res.data.days;
                    for(var dayI in $scope.days) {
                        var day = $scope.days[dayI];
                        if (day.workHours.length == 0) {
                            $scope.addRow(dayI);
                        }
                        $scope.$watch('days[' + dayI + '].workHours[0]', function (newValue, oldValue) {
//                          console.log(newValue.dayType + ":::" + oldValue.dayType);
                            if(newValue.dayType != oldValue.dayType) {
                                if (newValue.dayType == '8') {
                                    $scope.timeForTime -= 11;
                                } else if (oldValue.dayType == '8' && newValue.dayType != '8') {
                                    $scope.timeForTime += 11;
                                }
                            }
                        }, true);
                    }
                    $scope.active = res.data.active;
                    $scope.daysTotalTime = res.data.totalTime.days;
                    $scope.promisedTime = res.data.promisedTime;
                    break;
                }
                case 204 : {
                    //$scope.days = [];
                    //$scope.addRow();
                    break;
                }
            }
            $scope.calculateTableTotal();
            $scope.calculateOverTime();
        });

        $http.get('api/timeFor').then(function(res){
            $scope.timeForTime = res.data.timeForTime;
        });
    };

    $scope.save = function(){
        var daysToTransfer = {
            date : $scope.selectedDate,
            days : $scope.days
        };
        $http.post('api/timeTab', daysToTransfer).then(function(){
            $scope.calculateRest();
            addAlert();
        });
    };

    $scope.calculateRest = function(){
        for (var i = 0; i < 7; i++) {
            var day = $scope.days[i];
            for(var whI = 0; whI < day.workHours.length; whI++){
                var workHour = day.workHours[whI];
                var start = DateConverter.convertTimeStringToIntMinutes(workHour.startWorkingTime);
                var end = DateConverter.convertTimeStringToIntMinutes(workHour.endWorkingTime);
                var rest = workHour.restTime != "" ? parseInt(workHour.restTime) : 0;
                var time = end - start - rest;

                time = time/60;

                if (time >=  4.5 && time <   7.5) workHour.restTime = 30;
                else if (time >=  7.5 && time <  10.5) workHour.restTime = 60;
                else if (time >= 10.5 && time <  13.5) workHour.restTime = 90;
                else if (time >= 13.5 && time <  16.5) workHour.restTime = 120;
                else if (time >= 16.5) workHour.restTime = 150;
            }
        }
    };

    $scope.addRow = function(index){
        $scope.days[index].workHours.push({
                startWorkingTime: "",
                endWorkingTime: "",
                restTime: "",
                dayType : '0'
            }
        );

    };

    $scope.removeRow = function(dayIndex, index){
        $scope.days[dayIndex].workHours.splice(index, 1);
    };

    $scope.rowChanged = function(index) {
        //changing day total
        var oldDayTotal = $scope.daysTotalTime[index];
        var oldTotalDayTime = DateConverter.convertTimePairToIntMinutes(oldDayTotal);
        var day = $scope.days[index];
        var total = $scope.calculateRowTotal(index);
        if (total > 0) {
            var times = DateConverter.convertIntMinutesToTimeArray(total);
            $scope.daysTotalTime[index].h = times[0];
            $scope.daysTotalTime[index].m = times[1];
        }
        //now we need to calculate total mon-fri
        var currentTotalTime = DateConverter.convertTimePairToIntMinutes($scope.totalMonFri);
        currentTotalTime -= oldTotalDayTime;
        currentTotalTime += total;
        var totalMonFri = DateConverter.convertIntMinutesToTimePair(currentTotalTime);
        $scope.totalMonFri = totalMonFri;
        //we need to calculate overTime
        var totalMonSun = currentTotalTime
            + DateConverter.convertTimePairToIntMinutes($scope.daysTotalTime[5])
            + DateConverter.convertTimePairToIntMinutes($scope.daysTotalTime[6]);
        $scope.calculateOverTime();

        //now we need to change time-for-time
        if(day.dayType == '8'){

        }
    };

    $scope.calculateRowTotal = function(index){
        //changing day total
        var day = $scope.days[index];
        var total = 0;
        for(var whI = 0; whI < day.workHours.length; whI++){
            var workHour = day.workHours[whI];
            var start = DateConverter.convertTimeStringToIntMinutes(workHour.startWorkingTime);
            var end = DateConverter.convertTimeStringToIntMinutes(workHour.endWorkingTime);
            var rest = workHour.restTime != "" ? parseInt(workHour.restTime) : 0;
            var workHourTotal = end - start - rest;
            if(workHourTotal > 0)
                total += workHourTotal;
        }
        return total;
    };

    $scope.calculateTableTotal = function(){
        //fully calculate
        var totalFull = 0;
        for (var i = 0; i < 5; i++) {
            totalFull += $scope.calculateRowTotal(i);
        }
        if (totalFull >= 0) {
            var times = DateConverter.convertIntMinutesToTimeArray(totalFull);
            $scope.totalMonFri.h = times[0];
            $scope.totalMonFri.m = times[1];
        }
    };

    $scope.calculateOverTime = function(){
        var currentTotalTime = DateConverter.convertTimePairToIntMinutes($scope.totalMonFri);
        var totalMonSun = currentTotalTime
            + DateConverter.convertTimePairToIntMinutes($scope.daysTotalTime[5])
            + DateConverter.convertTimePairToIntMinutes($scope.daysTotalTime[6]);
        var promised = 0;
        for (var i = 0; i < 5; i++) {
            promised += parseInt($scope.promisedTime[i]);
        }
        promised *= 60;
        if (totalMonSun > promised) {
            var times = DateConverter.convertIntMinutesToTimeArray(totalMonSun - promised);
            $scope.overTime.h = times[0];
            $scope.overTime.m = times[1];
        }
    };

    $scope.dayTypeIsDisabled = function(dayIndex, index){
        var rez = $scope.days[dayIndex].workHours[index].dayType != '0';
        if(rez){
            $scope.days[dayIndex].workHours[index].startWorkingTime = "00:00";
            $scope.days[dayIndex].workHours[index].endWorkingTime = "00:00";
            $scope.days[dayIndex].workHours[index].restTime = "0";
        } else {
            var wh =  $scope.days[dayIndex].workHours[index];
            if(wh.startWorkingTime == "00:00" && wh.startWorkingTime == "00:00" && wh.restTime == "0"){
                $scope.days[dayIndex].workHours[index].startWorkingTime = "";
                $scope.days[dayIndex].workHours[index].endWorkingTime = "";
                $scope.days[dayIndex].workHours[index].restTime = "";
            }
        }
        return  rez;
    };

    $scope.isActiveWorkHourHide = function(dayIndex, index){
        var wh = $scope.days[dayIndex].workHours[0];
        var b = wh.dayType != '0' && index != 0;
        return  b;
    }

    $scope.applyDate();
});

app.directive('timepicker', ['$parse', function($parse) {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            //attrs.ngModel contains title of model element
            var modelElement = $parse(attrs.ngModel);
            $(element).clockpicker({
                    placement: 'bottom',
                    align: 'left',
                    autoclose: true,
                    'default': 'now',
                    afterDone: function() {
                        //assign html element value to model value
                        modelElement.assign(scope, element.val());
                        scope.rowChanged(scope.$parent.$index);
                        scope.$apply();
                    }
                })
        }
    }
}]);

app.directive('timepickerModal', ['$parse', function($parse) {
    return {
        restrict: "A",
        link: function(scope, element, attrs) {
            //attrs.ngModel contains title of model element
            var modelElement = $parse(attrs.ngModel);
            $(element).clockpicker({
                placement: 'bottom',
                align: 'left',
                autoclose: true,
                'default': 'now',
                afterDone: function() {
                    //assign html element value to model value
                    modelElement.assign(scope, element.val());
                    scope.$apply();
                }
            })
        }
    }
}]);

app.controller('DatepickerDemoController', function($scope, $http) {

  $scope.selectedDate = new Date();
  $scope.selectedDateAsNumber = Date.UTC(1986, 1, 22);
  // $scope.fromDate = new Date();
  // $scope.untilDate = new Date();
  $scope.getType = function(key) {
    return Object.prototype.toString.call($scope[key]);
  };

  $scope.clearDates = function() {
    $scope.selectedDate = null;
  };

});

//app.controller('DatepickerModalController', function($scope, $http) {
//
//  $scope.selectedDate = new Date();
//  $scope.selectedDateAsNumber = Date.UTC(1986, 1, 22);
//  // $scope.fromDate = new Date();
//  // $scope.untilDate = new Date();
//  $scope.getType = function(key) {
//    return Object.prototype.toString.call($scope[key]);
//  };
//
//  $scope.clearDates = function() {
//    $scope.selectedDate = null;
//  };
//
//    app.config(function($datepickerProvider) {
//  angular.extend($datepickerProvider.defaults, {
//    dateFormat: 'dd.MM.yyyy',
//    startWeek: 1,
//    daysOfWeekDisabled: '2'
//  });
//});
//});

//app.config(function($datepickerProvider) {
//  angular.extend($datepickerProvider.defaults, {
//    dateFormat: 'dd.MM.yyyy',
//    startWeek: 1
////    daysOfWeekDisabled: '0234567'
//  });
//});
app.directive('numberMask', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            $(element).numeric();
        }
    }
});
app.controller("settings_controller", ['$scope', function($scope){
$scope.days = [
    {day: 'Monday', settingsDay: 'monday'},{day: 'Tuesday',settingsDay: 'tuesday'},{day: 'Wednesday',settingsDay: 'wednesday'},{day: 'Thursday',settingsDay: 'thursday'},{day: 'Friday',settingsDay: 'friday'}
];
    

  }]);
app.controller("declaration_controller", function($scope, $http, $filter){

    $scope.selectedDate = DateConverter.convertDateToString(new Date());

    $scope.total = 0;

    $scope.activeV = true;

    $scope.costTypes = [
        { id: "0", name: 'Eendaagse netto' },
        { id: "1", name: 'Eendaagse bruto' },
        { id: "2", name: 'Meerdaagse netto' },
        { id: "3", name: 'Overstaan netto' },
        { id: "4", name: 'Overstaan bruto' }
    ];

    $scope.removeRow = function(dayIndex, index){
        $scope.days[dayIndex].declarations.splice(index, 1);
    };

    $scope.addRow = function(index){
        $scope.days[index].declarations.push({
                costType: $scope.costTypes["0"].id,
                price: 0,
                active: true
            }
        )
    };

    $scope.applyDate = function(){
        var formattedDate = $scope.selectedDate;

        $http.get('api/declaration', {params : {date : formattedDate}}).then(function(res){
            switch (res.status){
                case 200 :
                {
                    $scope.days = res.data.daysDeclaration;
                    for (var dayI = 0; dayI <$scope.days.length; dayI++) {
                        if($scope.days[dayI].declarations == undefined)
                            $scope.days[dayI].declarations = [];
                        for(var decI = 0; decI<$scope.days[dayI].declarations.length; decI++){
                            $scope.days[dayI].declarations[decI].active = false;
                        }
                        if($scope.days[dayI].declarations.length == 0)
                            $scope.addRow(dayI);

                    }
                    $scope.activeV = res.data.active;
                    $scope.calculateTotal();
                    break;
                }
                case 204 : {
                    $scope.days = [];
                    //$scope.addRow();
                    break;
                }
            }

        });

    };

    $scope.calculateTotal = function(){
        var total = 0;
        for (var dayI = 0; dayI <$scope.days.length; dayI++) {
            for (var decI = 0; decI < $scope.days[dayI].declarations.length; decI++) {
                total += parseInt($scope.days[dayI].declarations[decI].price);
            }
        }
        $scope.total = total;
    };

    $scope.save = function(){
        var declarationsToTransfer = {
            date : $scope.selectedDate,
            daysDeclaration : $scope.days
        };
        $http.post('api/declaration', declarationsToTransfer).then(function(){
            for (var dayI = 0; dayI <$scope.days.length; dayI++) {
                for (var decI = 0; decI < $scope.days[dayI].declarations.length; decI++) {
                    if($scope.days[dayI].declarations[decI].price != 0)
                        $scope.days[dayI].declarations[decI].active = false;
                }
            }
           addAlert();
        });
    };

    $scope.getDecLength = function(index){
        var length = $scope.days[index].declarations.length;
        if(length > 0) length--;
        return  length;
    };

    $scope.applyDate();

});

app.config(function ($datepickerProvider) {
    angular.extend($datepickerProvider.defaults, {
        dateFormat: 'dd.MM.yyyy',
        modelDateFormat: "dd.MM.yyyy",
        dateType: "string",
        startWeek: 1
    });
});


app.controller("overview_controller", ['$scope', function($scope){
$scope.totalTimes = [
    {tolalProc: '', overviewId: ''},{tolalProc: '100%', overviewId: '_100'},{tolalProc: '130%', overviewId: '_130'},{tolalProc: '150%', overviewId: '_150'},{tolalProc: '200%', overviewId: '_200'}
];
  }]);



//app.controller("time_select", ['$scope', function($scope){
//$scope.options = [
//    {val: '1', deskription: 'Werkdag'},{val: '2', deskription: 'Weekenddag'},{val: '3', deskription: 'Wachtdag'},{val: '4', deskription: 'Ziektedag'},{val: '5', deskription: 'Vakantiedag'},{val: '6', deskription: 'ATV-dag'},{val: '7', deskription: 'Betaald verlof'},{val: '8', deskription: 'Ontbetaald verlof'},{val: '9', deskription: 'Tijd-voor-tijd'},{val: '10', deskription: 'Overstaandag'},{val: '11', deskription: 'Zwangerschapsverlof'},{val: '12', deskription: 'Feestdag'},{val: '13', deskription: 'Geen werkdag'}
//];
//  }]);