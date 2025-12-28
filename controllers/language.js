// ===========================
// LANGUAGE CONTROLLER
// Handles multi-language support (English, French, German)
// ===========================

export class LanguageController {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'en';
        this.translations = {
            en: {
                // Navigation
                nav: {
                    home: 'Home',
                    info: 'Wedding Info',
                    gift: 'Gift Pot',
                    rsvp: 'RSVP',
                    albums: 'Albums'
                },
                // Home page
                home: {
                    tagline: "We're getting married!",
                    quickLinks: 'Quick Links',
                    venueDetails: 'Venue, schedule & details',
                    supportJourney: 'Support our journey',
                    letUsKnow: "Let us know you're coming",
                    viewPhotos: 'View our photos'
                },
                // Info page
                info: {
                    title: 'Wedding Information',
                    subtitle: 'Everything you need to know about our special day',
                    venue: 'Venue',
                    ceremonyReception: 'Ceremony & Reception',
                    schedule: 'Schedule',
                    guestArrival: 'Guest Arrival',
                    welcomeDrinks: 'Welcome Drinks',
                    ceremonyBegins: 'Religious Ceremony Begins',
                    cocktailHour: 'Cocktail Hour',
                    receptionDinner: 'Reception & Dinner',
                    lastDance: 'Last Dance',
                    dressCode: 'Dress Code',
                    formalAttire: 'Formal / Cocktail Attire',
                    dressCodeNote: 'Please wear what makes you feel comfortable and celebratory!',
                    colorCodeNote: 'Note : Only the Color code is compulsory, and the following are just suggestions for inspiration purpose.',
                    chooseColors: 'Choose your attire colors:',
                    selectMultiple: '(You can select multiple colors) The color name is displayed below',
                    selectedColors: 'Selected colors:',
                    noneYet: 'None yet',
                    getItinerary: 'Get Itinerary',
                    accommodations: 'Accommodations',
                    roomOptions: 'You have room options at the following hotels and villas:',
                    bookNow: 'Book Now',
                    faq: 'FAQ',
                    plusOne: 'Can I bring a plus one?',
                    plusOneAnswer: 'Please check your invitation. If you have a plus one, their name will be included.',
                    parking: 'Is there parking available?',
                    parkingAnswer: 'Yes, complimentary parking is available at the venue.',
                    ceremonyLocation: 'Will the ceremony be indoors or outdoors?',
                    ceremonyLocationAnswer: 'The ceremony will be outdoors (weather permitting) with an indoor backup plan.',
                    dietary: 'What if I have dietary restrictions?',
                    dietaryAnswer: 'Please let us know in your RSVP and we\'ll accommodate your needs.'
                },
                // RSVP page
                rsvp: {
                    title: 'RSVP',
                    subtitle: 'Please let us know if you can join us!',
                    deadline: 'Kindly respond by',
                    fullName: 'Full Name',
                    fullNamePlaceholder: 'Enter your full name',
                    email: 'Email',
                    emailPlaceholder: 'your.email@example.com',
                    phone: 'Phone Number',
                    phonePlaceholder: '+1 (555) 123-4567',
                    attending: 'Will you be attending?',
                    yes: "Yes, I'll be there! 🎉",
                    no: "Sorry, I can't make it 😢",
                    numberOfGuests: 'Number of Guests (including yourself)',
                    guest: 'Guest',
                    guests: 'Guests',
                    dietaryRestrictions: 'Dietary Restrictions or Allergies',
                    dietaryPlaceholder: 'Please let us know if you have any dietary restrictions or allergies',
                    message: 'Message for the Couple',
                    messagePlaceholder: 'Share your well wishes, song requests, or any questions you might have!',
                    submit: 'Submit RSVP',
                    setupInstructions: '🔧 Setup Instructions',
                    setupDescription: 'To enable RSVP submissions to Notion:',
                    setupNote: 'Note: The form will show a message even without Notion setup, but won\'t save data.'
                },
                // Gift page
                gift: {
                    title: 'Gift Pot',
                    subtitle: 'Your presence is the greatest gift, but if you\'d like to contribute to our future together, we\'d be grateful.',
                    onlinePayment: '💝 Online Payment Options',
                    givePayPal: 'Give via PayPal',
                    giveWise: 'Give via Wise',
                    weroPayment: '💶 Wero Payment',
                    weroDescription: 'You can also send a gift via Wero:',
                    bankTransfer: '🏦 Bank Transfer Details',
                    bankDescription: 'If you prefer to send a direct bank transfer:',
                    accountName: 'Account Name:',
                    reference: 'Reference:',
                    referencePlaceholder: 'Wedding Gift - [Your Name]',
                    thankYou: 'Thank you so much for your generosity.',
                    support: 'Your love and support mean the world to us!'
                },
                // Albums page
                albums: {
                    title: 'Wedding Albums',
                    subtitle: 'Relive the magic of our special day'
                },
                // Common
                common: {
                    days: 'Days',
                    hours: 'Hours',
                    minutes: 'Minutes',
                    seconds: 'Seconds',
                    madeWith: 'Made with ❤️'
                }
            },
            fr: {
                // Navigation
                nav: {
                    home: 'Accueil',
                    info: 'Infos Mariage',
                    gift: 'Cagnotte',
                    rsvp: 'RSVP',
                    albums: 'Albums'
                },
                // Home page
                home: {
                    tagline: 'Nous nous marions !',
                    quickLinks: 'Liens Rapides',
                    venueDetails: 'Lieu, horaires et détails',
                    supportJourney: 'Soutenez notre aventure',
                    letUsKnow: 'Faites-nous savoir si vous venez',
                    viewPhotos: 'Voir nos photos'
                },
                // Info page
                info: {
                    title: 'Informations sur le Mariage',
                    subtitle: 'Tout ce que vous devez savoir sur notre jour spécial',
                    venue: 'Lieu',
                    ceremonyReception: 'Cérémonie et Réception',
                    schedule: 'Programme',
                    guestArrival: 'Arrivée des Invités',
                    welcomeDrinks: 'Boissons de Bienvenue',
                    ceremonyBegins: 'Début de la Cérémonie Religieuse',
                    cocktailHour: 'Cocktail',
                    receptionDinner: 'Réception et Dîner',
                    lastDance: 'Dernière Danse',
                    dressCode: 'Code Vestimentaire',
                    formalAttire: 'Tenue Formelle / Cocktail',
                    dressCodeNote: 'Portez ce qui vous met à l\'aise et vous fait célébrer !',
                    colorCodeNote: 'Note : Seul le code couleur est obligatoire, et ce qui suit ne sont que des suggestions à titre d\'inspiration.',
                    chooseColors: 'Choisissez les couleurs de votre tenue :',
                    selectMultiple: '(Vous pouvez sélectionner plusieurs couleurs) Le nom de la couleur est affiché ci-dessous',
                    selectedColors: 'Couleurs sélectionnées :',
                    noneYet: 'Aucune pour le moment',
                    getItinerary: 'Obtenir l\'Itinéraire',
                    accommodations: 'Hébergements',
                    roomOptions: 'Vous avez des options de chambres dans les hôtels et villas suivants :',
                    bookNow: 'Réserver Maintenant',
                    faq: 'FAQ',
                    plusOne: 'Puis-je amener un accompagnateur ?',
                    plusOneAnswer: 'Veuillez vérifier votre invitation. Si vous avez un accompagnateur, son nom sera inclus.',
                    parking: 'Y a-t-il un parking disponible ?',
                    parkingAnswer: 'Oui, un parking gratuit est disponible sur le lieu.',
                    ceremonyLocation: 'La cérémonie sera-t-elle en intérieur ou en extérieur ?',
                    ceremonyLocationAnswer: 'La cérémonie se déroulera en extérieur (selon la météo) avec un plan de secours en intérieur.',
                    dietary: 'Et si j\'ai des restrictions alimentaires ?',
                    dietaryAnswer: 'Veuillez nous le faire savoir dans votre RSVP et nous accommoderons vos besoins.'
                },
                // RSVP page
                rsvp: {
                    title: 'RSVP',
                    subtitle: 'Veuillez nous faire savoir si vous pouvez nous rejoindre !',
                    deadline: 'Veuillez répondre avant le',
                    fullName: 'Nom Complet',
                    fullNamePlaceholder: 'Entrez votre nom complet',
                    email: 'Email',
                    emailPlaceholder: 'votre.email@exemple.com',
                    phone: 'Numéro de Téléphone',
                    phonePlaceholder: '+33 (0)6 12 34 56 78',
                    attending: 'Serez-vous présent(e) ?',
                    yes: 'Oui, je serai là ! 🎉',
                    no: 'Désolé(e), je ne peux pas venir 😢',
                    numberOfGuests: 'Nombre d\'Invités (vous inclus)',
                    guest: 'Invité',
                    guests: 'Invités',
                    dietaryRestrictions: 'Restrictions Alimentaires ou Allergies',
                    dietaryPlaceholder: 'Veuillez nous faire savoir si vous avez des restrictions alimentaires ou des allergies',
                    message: 'Message pour le Couple',
                    messagePlaceholder: 'Partagez vos vœux, demandes de chansons ou toute question que vous pourriez avoir !',
                    submit: 'Soumettre le RSVP',
                    setupInstructions: '🔧 Instructions de Configuration',
                    setupDescription: 'Pour activer les soumissions RSVP vers Notion :',
                    setupNote: 'Note : Le formulaire affichera un message même sans configuration Notion, mais ne sauvegardera pas les données.'
                },
                // Gift page
                gift: {
                    title: 'Cagnotte',
                    subtitle: 'Votre présence est le plus beau cadeau, mais si vous souhaitez contribuer à notre avenir ensemble, nous en serions reconnaissants.',
                    onlinePayment: '💝 Options de Paiement en Ligne',
                    givePayPal: 'Donner via PayPal',
                    giveWise: 'Donner via Wise',
                    weroPayment: '💶 Paiement Wero',
                    weroDescription: 'Vous pouvez également envoyer un cadeau via Wero :',
                    bankTransfer: '🏦 Détails du Virement Bancaire',
                    bankDescription: 'Si vous préférez envoyer un virement bancaire direct :',
                    accountName: 'Nom du Compte :',
                    reference: 'Référence :',
                    referencePlaceholder: 'Cadeau de Mariage - [Votre Nom]',
                    thankYou: 'Merci beaucoup pour votre générosité.',
                    support: 'Votre amour et votre soutien signifient tout pour nous !'
                },
                // Albums page
                albums: {
                    title: 'Albums de Mariage',
                    subtitle: 'Revivez la magie de notre jour spécial'
                },
                // Common
                common: {
                    days: 'Jours',
                    hours: 'Heures',
                    minutes: 'Minutes',
                    seconds: 'Secondes',
                    madeWith: 'Fait avec ❤️'
                }
            },
            de: {
                // Navigation
                nav: {
                    home: 'Startseite',
                    info: 'Hochzeitsinfos',
                    gift: 'Geschenkkasse',
                    rsvp: 'RSVP',
                    albums: 'Alben'
                },
                // Home page
                home: {
                    tagline: 'Wir heiraten!',
                    quickLinks: 'Schnelllinks',
                    venueDetails: 'Ort, Zeitplan & Details',
                    supportJourney: 'Unterstützen Sie unsere Reise',
                    letUsKnow: 'Lassen Sie uns wissen, ob Sie kommen',
                    viewPhotos: 'Unsere Fotos ansehen'
                },
                // Info page
                info: {
                    title: 'Hochzeitsinformationen',
                    subtitle: 'Alles, was Sie über unseren besonderen Tag wissen müssen',
                    venue: 'Veranstaltungsort',
                    ceremonyReception: 'Zeremonie & Empfang',
                    schedule: 'Zeitplan',
                    guestArrival: 'Ankunft der Gäste',
                    welcomeDrinks: 'Begrüßungsgetränke',
                    ceremonyBegins: 'Religiöse Zeremonie beginnt',
                    cocktailHour: 'Cocktailstunde',
                    receptionDinner: 'Empfang & Abendessen',
                    lastDance: 'Letzter Tanz',
                    dressCode: 'Dresscode',
                    formalAttire: 'Formelle / Cocktail-Kleidung',
                    dressCodeNote: 'Bitte tragen Sie, was Sie sich wohlfühlen lässt und feierlich ist!',
                    colorCodeNote: 'Hinweis: Nur der Farbcode ist obligatorisch, und die folgenden sind nur Vorschläge zu Inspirationszwecken.',
                    chooseColors: 'Wählen Sie Ihre Kleidungsfarben:',
                    selectMultiple: '(Sie können mehrere Farben auswählen) Der Farbname wird unten angezeigt',
                    selectedColors: 'Ausgewählte Farben:',
                    noneYet: 'Noch keine',
                    getItinerary: 'Route Abrufen',
                    accommodations: 'Unterkünfte',
                    roomOptions: 'Sie haben Zimmeroptionen in den folgenden Hotels und Villen:',
                    bookNow: 'Jetzt Buchen',
                    faq: 'FAQ',
                    plusOne: 'Kann ich eine Begleitperson mitbringen?',
                    plusOneAnswer: 'Bitte überprüfen Sie Ihre Einladung. Wenn Sie eine Begleitperson haben, wird deren Name aufgeführt.',
                    parking: 'Gibt es Parkplätze?',
                    parkingAnswer: 'Ja, kostenlose Parkplätze sind am Veranstaltungsort verfügbar.',
                    ceremonyLocation: 'Wird die Zeremonie drinnen oder draußen stattfinden?',
                    ceremonyLocationAnswer: 'Die Zeremonie findet im Freien statt (wetterabhängig) mit einem Indoor-Backup-Plan.',
                    dietary: 'Was ist, wenn ich diätetische Einschränkungen habe?',
                    dietaryAnswer: 'Bitte teilen Sie uns dies in Ihrer RSVP mit, und wir werden Ihre Bedürfnisse berücksichtigen.'
                },
                // RSVP page
                rsvp: {
                    title: 'RSVP',
                    subtitle: 'Bitte lassen Sie uns wissen, ob Sie teilnehmen können!',
                    deadline: 'Bitte antworten Sie bis zum',
                    fullName: 'Vollständiger Name',
                    fullNamePlaceholder: 'Geben Sie Ihren vollständigen Namen ein',
                    email: 'E-Mail',
                    emailPlaceholder: 'ihre.email@beispiel.com',
                    phone: 'Telefonnummer',
                    phonePlaceholder: '+49 (0)123 456789',
                    attending: 'Werden Sie teilnehmen?',
                    yes: 'Ja, ich werde da sein! 🎉',
                    no: 'Entschuldigung, ich kann nicht kommen 😢',
                    numberOfGuests: 'Anzahl der Gäste (einschließlich Ihnen)',
                    guest: 'Gast',
                    guests: 'Gäste',
                    dietaryRestrictions: 'Diätetische Einschränkungen oder Allergien',
                    dietaryPlaceholder: 'Bitte teilen Sie uns mit, ob Sie diätetische Einschränkungen oder Allergien haben',
                    message: 'Nachricht für das Paar',
                    messagePlaceholder: 'Teilen Sie Ihre Wünsche, Liedwünsche oder Fragen mit, die Sie haben könnten!',
                    submit: 'RSVP Absenden',
                    setupInstructions: '🔧 Einrichtungsanweisungen',
                    setupDescription: 'Um RSVP-Übermittlungen an Notion zu aktivieren:',
                    setupNote: 'Hinweis: Das Formular zeigt eine Nachricht auch ohne Notion-Einrichtung an, speichert jedoch keine Daten.'
                },
                // Gift page
                gift: {
                    title: 'Geschenkkasse',
                    subtitle: 'Ihre Anwesenheit ist das größte Geschenk, aber wenn Sie zu unserer gemeinsamen Zukunft beitragen möchten, wären wir dankbar.',
                    onlinePayment: '💝 Online-Zahlungsoptionen',
                    givePayPal: 'Über PayPal Geben',
                    giveWise: 'Über Wise Geben',
                    weroPayment: '💶 Wero-Zahlung',
                    weroDescription: 'Sie können auch ein Geschenk über Wero senden:',
                    bankTransfer: '🏦 Banküberweisungsdetails',
                    bankDescription: 'Wenn Sie eine direkte Banküberweisung bevorzugen:',
                    accountName: 'Kontoinhaber:',
                    reference: 'Referenz:',
                    referencePlaceholder: 'Hochzeitsgeschenk - [Ihr Name]',
                    thankYou: 'Vielen Dank für Ihre Großzügigkeit.',
                    support: 'Ihre Liebe und Unterstützung bedeuten uns die Welt!'
                },
                // Albums page
                albums: {
                    title: 'Hochzeitsalben',
                    subtitle: 'Erleben Sie die Magie unseres besonderen Tages erneut'
                },
                // Common
                common: {
                    days: 'Tage',
                    hours: 'Stunden',
                    minutes: 'Minuten',
                    seconds: 'Sekunden',
                    madeWith: 'Gemacht mit ❤️'
                }
            }
        };
    }

    init() {
        // Make language controller globally accessible for other controllers
        window.languageController = this;
        
        // Update HTML lang attribute to match the current language
        document.documentElement.lang = this.currentLanguage;
        
        this.setupLanguageSwitcher();
        this.applyLanguage(this.currentLanguage);
        this.updateLanguageSwitcher();
    }

    getStoredLanguage() {
        return localStorage.getItem('preferredLanguage') || 'en';
    }

    setStoredLanguage(lang) {
        localStorage.setItem('preferredLanguage', lang);
    }

    setupLanguageSwitcher() {
        // Create language switcher if it doesn't exist
        const navContainer = document.querySelector('.nav-container');
        if (!navContainer) return;

        let langSwitcher = document.querySelector('.language-switcher');
        if (!langSwitcher) {
            langSwitcher = document.createElement('div');
            langSwitcher.className = 'language-switcher';
            langSwitcher.innerHTML = `
                <button class="lang-btn" aria-label="Language Switcher">
                    <span class="lang-icon">🌐</span>
                    <span class="lang-current">${this.currentLanguage.toUpperCase()}</span>
                </button>
                <div class="lang-dropdown">
                    <button class="lang-option ${this.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">
                        <span class="lang-flag">🇬🇧</span>
                        <span>English</span>
                    </button>
                    <button class="lang-option ${this.currentLanguage === 'fr' ? 'active' : ''}" data-lang="fr">
                        <span class="lang-flag">🇫🇷</span>
                        <span>Français</span>
                    </button>
                    <button class="lang-option ${this.currentLanguage === 'de' ? 'active' : ''}" data-lang="de">
                        <span class="lang-flag">🇩🇪</span>
                        <span>Deutsch</span>
                    </button>
                </div>
            `;
            
            // Insert before admin button or at the end
            const adminBtn = navContainer.querySelector('.admin-btn');
            if (adminBtn) {
                navContainer.insertBefore(langSwitcher, adminBtn);
            } else {
                navContainer.appendChild(langSwitcher);
            }
        }

        // Add event listeners
        const langBtn = langSwitcher.querySelector('.lang-btn');
        const langOptions = langSwitcher.querySelectorAll('.lang-option');

        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langSwitcher.classList.toggle('active');
        });

        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const lang = option.dataset.lang;
                this.changeLanguage(lang);
                langSwitcher.classList.remove('active');
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!langSwitcher.contains(e.target)) {
                langSwitcher.classList.remove('active');
            }
        });
    }

    updateLanguageSwitcher() {
        const langSwitcher = document.querySelector('.language-switcher');
        if (!langSwitcher) return;

        const langCurrent = langSwitcher.querySelector('.lang-current');
        if (langCurrent) {
            langCurrent.textContent = this.currentLanguage.toUpperCase();
        }

        // Update active state
        const langOptions = langSwitcher.querySelectorAll('.lang-option');
        langOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.lang === this.currentLanguage) {
                option.classList.add('active');
            }
        });
    }

    changeLanguage(lang) {
        if (!this.translations[lang]) return;
        
        this.currentLanguage = lang;
        this.setStoredLanguage(lang);
        this.applyLanguage(lang);
        this.updateLanguageSwitcher();
        
        // Update HTML lang attribute
        document.documentElement.lang = lang;
    }

    applyLanguage(lang) {
        const t = this.translations[lang];
        if (!t) return;

        // Update navigation
        this.updateText('[data-i18n="nav.home"]', t.nav.home);
        this.updateText('[data-i18n="nav.info"]', t.nav.info);
        this.updateText('[data-i18n="nav.gift"]', t.nav.gift);
        this.updateText('[data-i18n="nav.rsvp"]', t.nav.rsvp);
        this.updateText('[data-i18n="nav.albums"]', t.nav.albums);

        // Update home page
        this.updateText('[data-i18n="home.tagline"]', t.home.tagline);
        this.updateText('[data-i18n="home.quickLinks"]', t.home.quickLinks);
        this.updateText('[data-i18n="home.venueDetails"]', t.home.venueDetails);
        this.updateText('[data-i18n="home.supportJourney"]', t.home.supportJourney);
        this.updateText('[data-i18n="home.letUsKnow"]', t.home.letUsKnow);
        this.updateText('[data-i18n="home.viewPhotos"]', t.home.viewPhotos);

        // Update info page
        this.updateText('[data-i18n="info.title"]', t.info.title);
        this.updateText('[data-i18n="info.subtitle"]', t.info.subtitle);
        this.updateText('[data-i18n="info.venue"]', t.info.venue);
        this.updateText('[data-i18n="info.ceremonyReception"]', t.info.ceremonyReception);
        this.updateText('[data-i18n="info.schedule"]', t.info.schedule);
        this.updateText('[data-i18n="info.guestArrival"]', t.info.guestArrival);
        this.updateText('[data-i18n="info.welcomeDrinks"]', t.info.welcomeDrinks);
        this.updateText('[data-i18n="info.ceremonyBegins"]', t.info.ceremonyBegins);
        this.updateText('[data-i18n="info.cocktailHour"]', t.info.cocktailHour);
        this.updateText('[data-i18n="info.receptionDinner"]', t.info.receptionDinner);
        this.updateText('[data-i18n="info.lastDance"]', t.info.lastDance);
        this.updateText('[data-i18n="info.dressCode"]', t.info.dressCode);
        this.updateText('[data-i18n="info.formalAttire"]', t.info.formalAttire);
        this.updateText('[data-i18n="info.dressCodeNote"]', t.info.dressCodeNote);
        this.updateText('[data-i18n="info.colorCodeNote"]', t.info.colorCodeNote);
        this.updateText('[data-i18n="info.chooseColors"]', t.info.chooseColors);
        this.updateText('[data-i18n="info.selectMultiple"]', t.info.selectMultiple);
        this.updateText('[data-i18n="info.selectedColors"]', t.info.selectedColors);
        this.updateText('[data-i18n="info.noneYet"]', t.info.noneYet);
        this.updateText('[data-i18n="info.getItinerary"]', t.info.getItinerary);
        this.updateText('[data-i18n="info.accommodations"]', t.info.accommodations);
        this.updateText('[data-i18n="info.roomOptions"]', t.info.roomOptions);
        this.updateText('[data-i18n="info.bookNow"]', t.info.bookNow);
        this.updateText('[data-i18n="info.faq"]', t.info.faq);
        this.updateText('[data-i18n="info.plusOne"]', t.info.plusOne);
        this.updateText('[data-i18n="info.plusOneAnswer"]', t.info.plusOneAnswer);
        this.updateText('[data-i18n="info.parking"]', t.info.parking);
        this.updateText('[data-i18n="info.parkingAnswer"]', t.info.parkingAnswer);
        this.updateText('[data-i18n="info.ceremonyLocation"]', t.info.ceremonyLocation);
        this.updateText('[data-i18n="info.ceremonyLocationAnswer"]', t.info.ceremonyLocationAnswer);
        this.updateText('[data-i18n="info.dietary"]', t.info.dietary);
        this.updateText('[data-i18n="info.dietaryAnswer"]', t.info.dietaryAnswer);

        // Update RSVP page
        this.updateText('[data-i18n="rsvp.title"]', t.rsvp.title);
        this.updateText('[data-i18n="rsvp.subtitle"]', t.rsvp.subtitle);
        this.updateText('[data-i18n="rsvp.deadline"]', t.rsvp.deadline);
        this.updateText('[data-i18n="rsvp.fullName"]', t.rsvp.fullName);
        this.updateText('[data-i18n="rsvp.email"]', t.rsvp.email);
        this.updateText('[data-i18n="rsvp.phone"]', t.rsvp.phone);
        this.updateText('[data-i18n="rsvp.attending"]', t.rsvp.attending);
        this.updateText('[data-i18n="rsvp.yes"]', t.rsvp.yes);
        this.updateText('[data-i18n="rsvp.no"]', t.rsvp.no);
        this.updateText('[data-i18n="rsvp.numberOfGuests"]', t.rsvp.numberOfGuests);
        this.updateText('[data-i18n="rsvp.guest"]', t.rsvp.guest);
        this.updateText('[data-i18n="rsvp.guests"]', t.rsvp.guests);
        this.updateText('[data-i18n="rsvp.dietaryRestrictions"]', t.rsvp.dietaryRestrictions);
        this.updateText('[data-i18n="rsvp.dietaryPlaceholder"]', t.rsvp.dietaryPlaceholder);
        this.updateText('[data-i18n="rsvp.message"]', t.rsvp.message);
        this.updateText('[data-i18n="rsvp.messagePlaceholder"]', t.rsvp.messagePlaceholder);
        this.updateText('[data-i18n="rsvp.submit"]', t.rsvp.submit);
        this.updateText('[data-i18n="rsvp.setupInstructions"]', t.rsvp.setupInstructions);
        this.updateText('[data-i18n="rsvp.setupDescription"]', t.rsvp.setupDescription);
        this.updateText('[data-i18n="rsvp.setupNote"]', t.rsvp.setupNote);

        // Update gift page
        this.updateText('[data-i18n="gift.title"]', t.gift.title);
        this.updateText('[data-i18n="gift.subtitle"]', t.gift.subtitle);
        this.updateText('[data-i18n="gift.onlinePayment"]', t.gift.onlinePayment);
        this.updateText('[data-i18n="gift.givePayPal"]', t.gift.givePayPal);
        this.updateText('[data-i18n="gift.giveWise"]', t.gift.giveWise);
        this.updateText('[data-i18n="gift.weroPayment"]', t.gift.weroPayment);
        this.updateText('[data-i18n="gift.weroDescription"]', t.gift.weroDescription);
        this.updateText('[data-i18n="gift.bankTransfer"]', t.gift.bankTransfer);
        this.updateText('[data-i18n="gift.bankDescription"]', t.gift.bankDescription);
        this.updateText('[data-i18n="gift.accountName"]', t.gift.accountName);
        this.updateText('[data-i18n="gift.reference"]', t.gift.reference);
        this.updateText('[data-i18n="gift.referencePlaceholder"]', t.gift.referencePlaceholder);
        this.updateText('[data-i18n="gift.thankYou"]', t.gift.thankYou);
        this.updateText('[data-i18n="gift.support"]', t.gift.support);

        // Update albums page
        this.updateText('[data-i18n="albums.title"]', t.albums.title);
        this.updateText('[data-i18n="albums.subtitle"]', t.albums.subtitle);

        // Update common elements
        this.updateText('[data-i18n="common.days"]', t.common.days);
        this.updateText('[data-i18n="common.hours"]', t.common.hours);
        this.updateText('[data-i18n="common.minutes"]', t.common.minutes);
        this.updateText('[data-i18n="common.seconds"]', t.common.seconds);
        this.updateText('[data-i18n="common.madeWith"]', t.common.madeWith);

        // Update placeholders
        this.updatePlaceholder('[data-i18n-placeholder="rsvp.fullName"]', t.rsvp.fullNamePlaceholder);
        this.updatePlaceholder('[data-i18n-placeholder="rsvp.email"]', t.rsvp.emailPlaceholder);
        this.updatePlaceholder('[data-i18n-placeholder="rsvp.phone"]', t.rsvp.phonePlaceholder);
        this.updatePlaceholder('[data-i18n-placeholder="rsvp.dietaryRestrictions"]', t.rsvp.dietaryPlaceholder);
        this.updatePlaceholder('[data-i18n-placeholder="rsvp.message"]', t.rsvp.messagePlaceholder);
        this.updatePlaceholder('[data-i18n-placeholder="gift.reference"]', t.gift.referencePlaceholder);

        // Update select options for guests
        this.updateGuestOptions(t.rsvp.guest, t.rsvp.guests);

        // Update selected colors display if it exists and no colors are selected
        const selectedColorsList = document.getElementById('selected-colors-list');
        const infoController = window.infoController;
        if (selectedColorsList && infoController && infoController.selectedColors.length === 0) {
            selectedColorsList.textContent = t.info.noneYet;
        }
    }

    updateText(selector, text) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el.tagName === 'INPUT' && el.type !== 'submit' && el.type !== 'button') {
                // Don't update input values, only labels
                return;
            }
            el.textContent = text;
        });
    }

    updatePlaceholder(selector, text) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el.placeholder !== undefined) {
                el.placeholder = text;
            }
        });
    }

    updateGuestOptions(guestSingular, guestPlural) {
        const guestsSelect = document.getElementById('guests');
        if (!guestsSelect) return;

        const options = guestsSelect.querySelectorAll('option');
        options.forEach((option, index) => {
            const count = index + 1;
            if (count === 1) {
                option.textContent = `${count} ${guestSingular}`;
            } else {
                option.textContent = `${count} ${guestPlural}`;
            }
        });
    }

    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Return key if translation not found
            }
        }
        
        return value;
    }
}

