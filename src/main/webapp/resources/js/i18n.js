var defaultLang = 'nl';

app.run(function ($rootScope, $translate, $state, $location, $stateParams) {
    $rootScope.pr = $stateParams;
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        $translate.use(toParams.locale);
    });

    $stateParams.locale = defaultLang;

    $rootScope.changeLocale = function(locale){
        $stateParams.locale = locale;
        //$state.transitionTo($state.current, {locale : locale}, { location: false});
        $state.reload();
    };
});

app.config(function($stateProvider, $urlRouterProvider) {


    $urlRouterProvider.otherwise("/" + defaultLang + "/index/login");
    $urlRouterProvider.when("/en/client", "/en/client/home");
    $urlRouterProvider.when("/nl/client", "/nl/client/home");

    $stateProvider
        .state('locale', {
            url: "/{locale}",
            template: "<ui-view/>",
            abstract: true
        })
    ;
});

app.config(['$translateProvider', function ($translateProvider) {
    $translateProvider.translations('en', {
        //for client-page
        'Name': 'Name',
        'RegNum': 'Registration number',
        'Date': 'Date',
        'Apply': 'Apply',
        'OverTrip': 'Overnight trip',
        'AvailableTFT': 'Available time-for-time',
        'Save': 'Save',
        'AnotherTrip': 'Another trip',
        'Delete': 'Delete',
        'TotalWorked': 'Total worked',
        'TotalWorkedMonFri': 'Total worked mon-fri',
        'TotalOverHours': 'Total over hours',
        'TotalWorkedSaturday': 'Total worked Saturday',
        'TotalWorkedSunday': 'Total worked Sunday',
        'RestMin': 'Rest min',
        'End': 'End',
        'Start': 'Start',
        'StartDate': 'Start date',
        'Close': 'Close',
        'SaveChanges': 'Save changes',
        'TotalHours': 'Total hours',
        'worked': 'worked',
        'DownloadPDF': 'Download PDF',
        'KortenDeclaration': 'Korten declaration',
        'Total': 'Korten declaration',
        'ScheduledWorkours': 'Scheduled work hours',
        'UseSaturdayHoursAsTFT': 'Use Saturday hours as time-for-time',
        'Period': 'Period',
        'StartTFTRegulation': 'Start time-for-time regulation',
        'Home': 'Home',
        'Time': 'Time',
        'Overview': 'Overview',
        'Declaration': 'Declaration',
        'Settings': 'Settings',
        'Logout': 'Logout',
        //for login page
        'Login': 'Login',
        'Registration': 'Registration',
        'ForgotPassword': 'Forgot password',
        'EnterUsername': 'EnterUsername',
        'LastName': 'Lastname',
        'EnterLastName': 'Enter lastname',
        'Email': 'Email',
        'InvalidEmail': 'Invalid Email',
        'InvalidRegNum': 'Invalid Registration number ',
        'Password': 'Password ',
        'PasswordsNotMatch': 'Passwords do not match ',
        'RepeatPassword': 'Repeat password ',
        'InsufficientlyComplexPassword': 'Insufficiently complex password ',
        'EnterYourEmail': 'Enter your Email ',
        'SendPassword': 'Send password ',
        'EnterEmailAddress': 'Enter Email address ',
        'PasswordEmpty': 'Password empty',
        'WeekDays' : {
            '0' : 'Monday',
            "1" : "Tuesday",
            "2" : "Wednesday",
            "3" : "Thursday",
            "4" : "Friday",
            "5" : "Saturday",
            "6" : "Sunday"
        },
        "dataNotValidSaving" : "data is not valid. Saving process will be canceled"
    });

    $translateProvider.translations('nl', {
        //for client-page
        'Name': 'Naam',
        'RegNum': 'Personeels nummer',
        'Date': 'Datum',
        'Apply': 'Brengen',
        'OverTrip': 'Nachtelijke reis',
        'AvailableTFT': 'Beschikbare  tijd-voor-tijd',
        'Save': 'Opslaan',
        'AnotherTrip': 'Toevoegen rit',
        'Delete': 'Verwijderen',
        'TotalWorked': 'Totaal aantal',
        'TotalWorkedMonFri': 'Taantal maan-vrij',
        'TotalOverHours': 'Totaal meer dan uur',
        'TotalWorkedSaturday': 'Totaal werkte Zaterdag',
        'TotalWorkedSunday': 'Totaal werkte Zondag',
        'RestMin': 'Rust min',
        'End': 'Einde',
        'Start': 'Begin',
        'StartDate': 'Begin datum',
        'Close': 'Dicht',
        'SaveChanges': 'Wijzigingen opslaan',
        'TotalHours': 'Totaal aantal uren',
        'worked': 'gewerkt',
        'DownloadPDF': 'Download as PDF',
        'KortenDeclaration': 'Korten declaration',
        'Total': 'Totaal',
        'ScheduledWorkours': 'Geplande werkzaamheden uur',
        'UseSaturdayHoursAsTFT': 'Gebruik zaterdag uren als tijd-voor-tijd',
        'Period': 'Periode',
        'StartTFTRegulation': 'Start tijd-voor-tijd regeling',
        'Home': 'Hoofdpagina',
        'Time': 'Tijd',
        'Overview': 'Overzicht',
        'Declaration': 'Declaraties',
        'Settings': 'Instellingen',
        'Logout': 'Uitloggen',
        //for login page
        'Login': 'Log In',
        'Registration': 'Registratie',
        'ForgotPassword': 'Wachtwoord vergeten',
        'EnterUsername': 'Voer gebruikersnaam',
        'LastName': 'Achternaam',
        'EnterLastName': 'Voer achternaam',
        'Email': 'Email',
        'InvalidEmail': 'Ongeldig',
        'InvalidRegNum': 'Ongeldig Registration number',
        'Password': 'Wachtwoord',
        'PasswordsNotMatch': 'Wachtwoorden komen niet overeen',
        'RepeatPassword': 'Herhaal wachtwoord',
        'InsufficientlyComplexPassword': 'Onvoldoende complex wachtwoord',
        'EnterYourEmail': 'Vul uw e-mail',
        'SendPassword': 'Stuur wachtwoord',
        'EnterEmailAddress': 'Geef e-mail adres',
        'PasswordEmpty': 'Password leeg',
        'WeekDays' : {
            '0' : 'Maandag',
            "1" : "Dinsdag",
            "2" : "Woensdag",
            "3" : "Donderdag",
            "4" : "Vrijdag",
            "5" : "Zaterdag",
            "6" : "Zondag"
        },
        "dataNotValidSaving" : "gegevens is niet geldig. Het opslaan proces zal worden geannuleerd"
    });

    $translateProvider.preferredLanguage(defaultLang);
}]);