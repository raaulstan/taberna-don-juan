import type { Locale } from "@/i18n/config";
import type { LegalDocument, legalIdentity } from "@/config/legal";

type LegalSection = { id: string; title: string; paragraphs: string[] };
type LegalPageCopy = { title: string; intro: string; sections: LegalSection[] };
type LegalCopy = {
  updated: string; identityTitle: string; pendingTitle: string; pendingIntro: string;
  pendingValue: string; businessTypePending: string; hostingPending: string; retentionPending: string;
  restaurantContact: string; pageContents: string; otherDocuments: string; references: string;
  identityFields: Record<keyof typeof legalIdentity, string>;
  documents: Record<LegalDocument, LegalPageCopy>;
};

const translatedLegalCopy = {
  it: {
    updated: "Ultimo aggiornamento", identityTitle: "Identificazione del titolare", pendingTitle: "Informazioni da completare",
    pendingIntro: "I testi descrivono il sito attuale. Servono i dati e le conferme seguenti prima di considerarli definitivi; non sono stati sostituiti con informazioni inventate.",
    pendingValue: "Da fornire", businessTypePending: "Forma giuridica del titolare", hostingPending: "Condizioni di hosting e garanzie applicabili ai trasferimenti di dati", retentionPending: "Criteri specifici di conservazione dei dati e dei registri tecnici",
    restaurantContact: "Contatti pubblici del ristorante", pageContents: "In questa pagina", otherDocuments: "Documenti correlati", references: "Informazioni del fornitore e dell’autorità di controllo",
    identityFields: { name: "Nome o ragione sociale", taxId: "Codice fiscale o identificativo tributario", registeredAddress: "Indirizzo del titolare", contactEmail: "E-mail di contatto e privacy", registryDetails: "Dati di registrazione, se applicabili" },
    documents: {
      privacidad: {
        title: "Informativa sulla privacy", intro: "Questa informativa spiega il trattamento dei dati collegato al sito informativo di Taberna Don Juan, al menù e ai contatti pubblicati.",
        sections: [
          { id: "processing", title: "Dati che possono essere trattati", paragraphs: ["Il sito non ha account, database dei visitatori, moduli, pagamenti o prenotazioni online. Ricerca e filtri funzionano nel browser e non inviano le ricerche a un servizio di analisi.", "Per fornire le pagine e proteggere il servizio, l’hosting può trattare dati tecnici quali indirizzo IP, browser, pagina richiesta, data, ora ed errori. Se contatti il ristorante, i dati forniti vengono utilizzati per rispondere alla richiesta."] },
          { id: "purposes", title: "Finalità e basi giuridiche", paragraphs: ["I dati tecnici servono a fornire il sito, risolvere problemi e mantenerne la sicurezza, sulla base dell’interesse legittimo a offrire un servizio affidabile. Le richieste vengono gestite per rispondere e, se necessario, compiere attività precontrattuali o rispettare obblighi legali.", "Questa versione non include pubblicità personalizzata, profilazione commerciale o decisioni automatizzate con effetti giuridici sui visitatori."] },
          { id: "hosting", title: "Hosting, destinatari e trasferimenti", paragraphs: ["Il sito è ospitato da Vercel Inc. Il fornitore può trattare dati tecnici secondo le proprie condizioni e informativa. La sua infrastruttura può comportare trattamenti fuori dallo Spazio economico europeo.", "Il titolare deve confermare le condizioni sottoscritte, le garanzie di trasferimento applicabili al piano e i fornitori coinvolti. Questi punti restano espressamente da verificare; non si affermano accordi o garanzie non controllati. I dati possono essere comunicati anche quando richiesto dalla legge."] },
          { id: "retention", title: "Conservazione", paragraphs: ["I contatti sono conservati per il tempo necessario a gestire la richiesta e, se applicabile, per i termini legali relativi a eventuali responsabilità. Il sito non li aggiunge a un elenco pubblicitario.", "Durata e configurazione dei registri di hosting devono essere confermate con il fornitore e precisate qui. Non viene pubblicato un termine fittizio."] },
          { id: "rights", title: "I tuoi diritti", paragraphs: ["Quando applicabile, puoi richiedere accesso, rettifica, cancellazione, opposizione, limitazione o portabilità, e revocare un consenso senza pregiudicare il trattamento precedente. Il contatto specifico per la privacy deve ancora essere fornito nei dati del titolare.", "Puoi usare i contatti pubblici del ristorante e presentare un reclamo all’Agenzia spagnola per la protezione dei dati, www.aepd.es, se ritieni che i tuoi diritti non siano stati rispettati."] },
          { id: "external-links", title: "Collegamenti ad altri servizi", paragraphs: ["Google Maps e i social si aprono solo cliccando sui relativi link. Non sono incorporate mappe o widget social. Visitando questi servizi si applicano le rispettive informative."] },
          { id: "updates", title: "Aggiornamenti", paragraphs: ["Le informazioni saranno riviste quando cambiano funzionalità, fornitori o dati del titolare. La data identifica la versione pubblicata."] },
        ],
      },
      cookies: {
        title: "Informativa sui cookie", intro: "Questa pagina descrive cookie e tecnologie simili del sito attuale e la loro gestione nel browser.",
        sections: [
          { id: "cookie-use", title: "Utilizzo attuale dei cookie", paragraphs: ["Il codice del sito non include cookie propri di analisi, pubblicità o autenticazione. Le verifiche della versione pubblica non hanno individuato cookie di sessione creati dall’applicazione.", "L’hosting può applicare meccanismi tecnici di sicurezza o distribuzione secondo le proprie condizioni. Ogni cookie effettivamente introdotto dovrà essere indicato qui con fornitore, finalità e durata."] },
          { id: "preferences", title: "Lingua, ricerca e preferenze", paragraphs: ["La lingua è identificata nell’indirizzo della pagina. Filtri, ricerca e vista del menù sono gestiti in memoria durante la navigazione, senza profili dei visitatori o persistenza tramite cookie o archiviazione locale.", "La normale cache del browser facilita il caricamento di immagini, font e pagine; non crea account o sessioni utente."] },
          { id: "third-parties", title: "Servizi esterni", paragraphs: ["Font e immagini sono serviti dal progetto. I link Maps e social non incorporano i servizi nella pagina; cookie e informative di tali servizi si applicano quando scegli di visitarli."] },
          { id: "browser-settings", title: "Gestire i cookie", paragraphs: ["Puoi consultare, bloccare o eliminare cookie e dati dei siti nelle impostazioni privacy di Chrome, Safari, Firefox, Edge o di un altro browser. Le opzioni dipendono dal programma e dal dispositivo.", "Se saranno aggiunti cookie non necessari, verranno descritti e saranno offerte le scelte di consenso applicabili prima dell’attivazione."] },
          { id: "changes", title: "Revisione e titolare", paragraphs: ["L’informativa sarà aggiornata se cambiano configurazione o servizi. Dati mancanti del titolare e conferme tecniche sono elencati espressamente all’inizio."] },
        ],
      },
      "aviso-legal": {
        title: "Note legali", intro: "Queste note regolano accesso e utilizzo del sito informativo di Taberna Don Juan. L’identificazione dell’attività deve essere completata con i dati reali indicati di seguito.",
        sections: [
          { id: "purpose", title: "Scopo del sito", paragraphs: ["Il sito presenta il ristorante, il menù, i prezzi pubblicati e i contatti. Non offre contratti, ordini, pagamenti o un sistema di prenotazioni online."] },
          { id: "use", title: "Utilizzo", paragraphs: ["Puoi consultare pagine e collegamenti in modo lecito e rispettoso. Non sono consentiti tentativi di alterare il servizio, introdurre codice dannoso o violare i diritti altrui."] },
          { id: "menu-information", title: "Informazioni sul menù", paragraphs: ["I prezzi sono in euro e corrispondono al prodotto o formato indicato. Pubblicare un piatto non ne conferma la disponibilità in tempo reale e non implica misure, ingredienti o condizioni non dichiarate.", "Le informazioni possono essere aggiornate per correggere errori o riflettere cambiamenti. Per domande sull’offerta specifica puoi usare i contatti pubblicati."] },
          { id: "intellectual-property", title: "Proprietà intellettuale", paragraphs: ["Marchio, testi, fotografie, design e altre risorse sono soggetti ai diritti dei rispettivi titolari e alle licenze applicabili. L’accesso non concede diritti di sfruttamento oltre gli usi consentiti dalla legge o espressamente autorizzati."] },
          { id: "external-links", title: "Link esterni", paragraphs: ["I collegamenti a mappe e social facilitano informazione e contatto. Le destinazioni hanno condizioni proprie; un link non implica controllo su tutti i loro contenuti o servizi."] },
          { id: "responsibility", title: "Funzionamento e responsabilità", paragraphs: ["Si cerca di mantenere informazioni e servizio disponibili e aggiornati, ma possono verificarsi problemi tecnici o modifiche. Queste note non limitano i diritti dei consumatori o le responsabilità non escludibili per legge."] },
          { id: "applicable-law", title: "Norme applicabili e contatto", paragraphs: ["Si applicano le norme spagnole ed europee pertinenti, incluse quelle imperative sulla tutela dei consumatori e sulla competenza giudiziaria. Puoi contattare il ristorante; e-mail e identificazione completa del titolare restano da fornire."] },
        ],
      },
    },
  },
  de: {
    updated: "Letzte Aktualisierung", identityTitle: "Angaben zum Betreiber", pendingTitle: "Noch zu ergänzende Angaben",
    pendingIntro: "Diese Texte beschreiben die aktuelle Website. Vor einer endgültigen Verwendung fehlen die folgenden Angaben und Bestätigungen; sie wurden nicht durch erfundene Daten ersetzt.",
    pendingValue: "Noch bereitzustellen", businessTypePending: "Rechtsform des Betreibers", hostingPending: "Hostingbedingungen und anwendbare Garantien für Datenübermittlungen", retentionPending: "Konkrete Aufbewahrungskriterien für Daten und technische Protokolle",
    restaurantContact: "Öffentliche Restaurantkontaktdaten", pageContents: "Auf dieser Seite", otherDocuments: "Weitere Dokumente", references: "Informationen des Anbieters und der Aufsichtsbehörde",
    identityFields: { name: "Name oder Firmenname", taxId: "Steueridentifikationsnummer", registeredAddress: "Anschrift des Betreibers", contactEmail: "Kontakt- und Datenschutz-E-Mail", registryDetails: "Registerangaben, falls zutreffend" },
    documents: {
      privacidad: {
        title: "Datenschutzerklärung", intro: "Diese Erklärung beschreibt die Datenverarbeitung im Zusammenhang mit der Informationswebsite der Taberna Don Juan, ihrer Karte und den veröffentlichten Kontaktwegen.",
        sections: [
          { id: "processing", title: "Möglicherweise verarbeitete Daten", paragraphs: ["Die Website bietet keine Konten, Besucherdatenbank, Formulare, Zahlungen oder Online-Reservierungen. Suche und Filter laufen im Browser; Suchanfragen werden nicht an einen Analysedienst übermittelt.", "Zur Bereitstellung und Absicherung können beim Hosting technische Daten wie IP-Adresse, Browser, angeforderte Seite, Datum, Uhrzeit und Fehlerinformationen verarbeitet werden. Bei einer Kontaktaufnahme werden Ihre Angaben zur Beantwortung genutzt."] },
          { id: "purposes", title: "Zwecke und Rechtsgrundlagen", paragraphs: ["Technische Daten dienen der Auslieferung, Fehlerbehebung und Sicherheit, gestützt auf das berechtigte Interesse an einem zuverlässigen Angebot. Anfragen werden zur Beantwortung und gegebenenfalls für vorvertragliche Maßnahmen oder gesetzliche Pflichten bearbeitet.", "Diese Version enthält keine personalisierte Werbung, kein kommerzielles Profiling und keine automatisierten Entscheidungen mit rechtlicher Wirkung für Besucher."] },
          { id: "hosting", title: "Hosting, Empfänger und Übermittlungen", paragraphs: ["Die Website wird bei Vercel Inc. gehostet. Der Anbieter kann technische Daten nach eigenen Bedingungen und seiner Datenschutzerklärung verarbeiten. Seine Infrastruktur kann Verarbeitungen außerhalb des Europäischen Wirtschaftsraums einschließen.", "Der Betreiber muss die vereinbarten Bedingungen, die für seinen Tarif geltenden Übermittlungsgarantien und beteiligte Anbieter bestätigen. Diese Punkte bleiben ausdrücklich offen; ungeprüfte Verträge oder Garantien werden nicht behauptet. Daten können außerdem aufgrund gesetzlicher Pflichten offengelegt werden."] },
          { id: "retention", title: "Speicherdauer", paragraphs: ["Kontaktdaten werden so lange aufbewahrt, wie es zur Bearbeitung der Anfrage und gegebenenfalls aufgrund gesetzlicher Fristen für mögliche Ansprüche nötig ist. Die Website übernimmt sie nicht in einen Werbeverteiler.", "Dauer und Konfiguration der Hostingprotokolle müssen beim Anbieter bestätigt und hier konkretisiert werden. Eine erfundene Frist wird nicht angegeben."] },
          { id: "rights", title: "Ihre Rechte", paragraphs: ["Soweit anwendbar, können Sie Auskunft, Berichtigung, Löschung, Widerspruch, Einschränkung oder Übertragbarkeit verlangen und eine Einwilligung mit Wirkung für die Zukunft widerrufen. Der besondere Datenschutzkontakt muss in den Betreiberangaben noch ergänzt werden.", "Anfragen sind über die öffentlichen Restaurantkontakte möglich. Wenn Sie Ihre Rechte verletzt sehen, können Sie sich bei der spanischen Datenschutzbehörde unter www.aepd.es beschweren."] },
          { id: "external-links", title: "Links zu anderen Diensten", paragraphs: ["Google Maps und soziale Netzwerke öffnen sich erst beim Anklicken. Karten oder soziale Widgets sind nicht eingebettet. Beim Besuch dieser Dienste gelten deren eigene Datenschutzhinweise."] },
          { id: "updates", title: "Aktualisierungen", paragraphs: ["Diese Angaben werden bei Änderungen an Funktionen, Anbietern oder Betreiberinformationen überprüft. Das Datum kennzeichnet die veröffentlichte Fassung."] },
        ],
      },
      cookies: {
        title: "Cookie-Richtlinie", intro: "Diese Seite erläutert Cookies und ähnliche Technologien der aktuellen Website sowie deren Verwaltung im Browser.",
        sections: [
          { id: "cookie-use", title: "Aktuelle Verwendung", paragraphs: ["Der Websitecode enthält keine eigenen Analyse-, Werbe- oder Anmelde-Cookies. Bei den Prüfungen der öffentlichen Version wurden keine von der Anwendung angelegten Sitzungscookies festgestellt.", "Das Hosting kann nach seinen Bedingungen technische Sicherheits- oder Auslieferungsmechanismen einsetzen. Tatsächlich hinzugefügte Cookies müssen hier mit Anbieter, Zweck und Dauer aufgeführt werden."] },
          { id: "preferences", title: "Sprache, Suche und Einstellungen", paragraphs: ["Die Sprache wird durch die Seitenadresse bestimmt. Filter, Suche und Kartenansicht bleiben während der Nutzung im Arbeitsspeicher, ohne Besucherprofil oder dauerhafte Ablage in Cookies oder lokalem Speicher.", "Der übliche Browsercache beschleunigt Bilder, Schriften und Seiten; er erstellt kein Benutzerkonto und keine Sitzung."] },
          { id: "third-parties", title: "Externe Dienste", paragraphs: ["Schriften und Bilder stammen aus dem Projekt. Maps- und Social-Media-Links betten deren Dienste nicht ein; deren Cookies und Regeln gelten, wenn Sie diese Angebote besuchen."] },
          { id: "browser-settings", title: "Cookies verwalten", paragraphs: ["Cookies und Websitedaten lassen sich in den Datenschutzeinstellungen von Chrome, Safari, Firefox, Edge oder anderen Browsern einsehen, blockieren und löschen. Die Möglichkeiten hängen von Browser und Gerät ab.", "Sollten künftig nicht notwendige Cookies hinzukommen, werden sie erläutert und die nötigen Einwilligungsoptionen vor ihrer Aktivierung angeboten."] },
          { id: "changes", title: "Überprüfung und Verantwortlicher", paragraphs: ["Bei Änderungen an Einstellungen oder Diensten wird diese Richtlinie angepasst. Fehlende Betreiberangaben und technische Bestätigungen sind am Dokumentanfang ausdrücklich aufgeführt."] },
        ],
      },
      "aviso-legal": {
        title: "Rechtliche Hinweise", intro: "Diese Hinweise regeln Zugang und Nutzung der Informationswebsite der Taberna Don Juan. Die Unternehmensidentifikation muss mit den unten genannten tatsächlichen Daten ergänzt werden.",
        sections: [
          { id: "purpose", title: "Zweck der Website", paragraphs: ["Die Website stellt Restaurant, Karte, veröffentlichte Preise und Kontaktwege vor. Online-Vertragsschlüsse, Bestellungen, Zahlungen oder Reservierungen werden nicht angeboten."] },
          { id: "use", title: "Nutzung", paragraphs: ["Seiten und Links dürfen rechtmäßig und respektvoll genutzt werden. Untersagt sind Eingriffe in den Dienst, schädlicher Code und Verletzungen fremder Rechte."] },
          { id: "menu-information", title: "Angaben zur Karte", paragraphs: ["Preise werden in Euro für das genannte Produkt oder Format angegeben. Ein veröffentlichtes Gericht bestätigt weder Echtzeitverfügbarkeit noch nicht ausdrücklich genannte Mengen, Zutaten oder Bedingungen.", "Angaben können zur Fehlerkorrektur oder bei Änderungen des Restaurants angepasst werden. Fragen zum konkreten Angebot sind über die veröffentlichten Kontakte möglich."] },
          { id: "intellectual-property", title: "Geistiges Eigentum", paragraphs: ["Marke, Texte, Fotos, Gestaltung und weitere Materialien unterliegen den Rechten ihrer jeweiligen Inhaber und den geltenden Lizenzen. Der Zugriff räumt außer gesetzlich zulässigen oder ausdrücklich erlaubten Nutzungen keine Verwertungsrechte ein."] },
          { id: "external-links", title: "Externe Links", paragraphs: ["Karten- und Social-Media-Links erleichtern Information und Kontakt. Für die Ziele gelten eigene Bedingungen; ein Link bedeutet keine Kontrolle über alle dortigen Inhalte oder Leistungen."] },
          { id: "responsibility", title: "Betrieb und Verantwortung", paragraphs: ["Die Informationen und der Dienst sollen verfügbar und aktuell bleiben; technische Störungen und Änderungen sind dennoch möglich. Diese Hinweise beschränken weder Verbraucherrechte noch gesetzlich nicht ausschließbare Haftung."] },
          { id: "applicable-law", title: "Anwendbare Regeln und Kontakt", paragraphs: ["Es gelten die einschlägigen spanischen und europäischen Vorschriften einschließlich zwingender Verbraucher- und Zuständigkeitsregeln. Anfragen können an das Restaurant gerichtet werden; E-Mail und vollständige Betreiberidentifikation bleiben noch zu ergänzen."] },
        ],
      },
    },
  },
  fr: {
    updated: "Dernière mise à jour", identityTitle: "Identification de l’exploitant", pendingTitle: "Informations à compléter",
    pendingIntro: "Ces textes décrivent le site actuel. Les informations et confirmations suivantes restent nécessaires avant de les considérer comme définitifs ; aucune donnée fictive ne les remplace.",
    pendingValue: "À fournir", businessTypePending: "Forme juridique de l’exploitant", hostingPending: "Conditions d’hébergement et garanties applicables aux transferts de données", retentionPending: "Critères précis de conservation des données et journaux techniques",
    restaurantContact: "Coordonnées publiques du restaurant", pageContents: "Sur cette page", otherDocuments: "Documents associés", references: "Informations du prestataire et de l’autorité de contrôle",
    identityFields: { name: "Nom ou raison sociale", taxId: "Identifiant fiscal", registeredAddress: "Adresse de l’exploitant", contactEmail: "Adresse électronique de contact et confidentialité", registryDetails: "Informations d’immatriculation, le cas échéant" },
    documents: {
      privacidad: {
        title: "Politique de confidentialité", intro: "Cette politique explique les traitements de données liés au site d’information de Taberna Don Juan, à sa carte et aux moyens de contact publiés.",
        sections: [
          { id: "processing", title: "Données susceptibles d’être traitées", paragraphs: ["Le site ne propose ni comptes, ni base de visiteurs, ni formulaires, ni paiements, ni réservations en ligne. La recherche et les filtres fonctionnent dans le navigateur, sans transmettre les recherches à un service d’analyse.", "Pour afficher les pages et protéger le service, l’hébergement peut traiter des données techniques : adresse IP, navigateur, page demandée, date, heure et erreurs. Si vous contactez le restaurant, les informations fournies servent à répondre à votre demande."] },
          { id: "purposes", title: "Finalités et bases du traitement", paragraphs: ["Les données techniques permettent de servir le site, résoudre les incidents et assurer sa sécurité, sur la base de l’intérêt légitime à fournir un service fiable. Les demandes sont traitées pour vous répondre et, si nécessaire, effectuer des démarches précontractuelles ou respecter une obligation légale.", "Cette version ne comporte ni publicité personnalisée, ni profilage commercial, ni décision automatisée produisant des effets juridiques sur les visiteurs."] },
          { id: "hosting", title: "Hébergement, destinataires et transferts", paragraphs: ["Le site est hébergé par Vercel Inc. Ce prestataire peut traiter des données techniques selon ses propres conditions et sa politique de confidentialité. Son infrastructure peut impliquer des traitements hors de l’Espace économique européen.", "L’exploitant doit confirmer les conditions souscrites, les garanties de transfert applicables à son offre et les prestataires concernés. Ces points restent expressément à confirmer ; aucun contrat ou garantie non vérifié n’est affirmé. Des données peuvent aussi être communiquées lorsque la loi l’exige."] },
          { id: "retention", title: "Conservation", paragraphs: ["Les coordonnées sont conservées le temps nécessaire pour répondre à la demande et, le cas échéant, pendant les durées légales liées à d’éventuelles responsabilités. Le site ne les ajoute pas à une liste publicitaire.", "La durée et la configuration des journaux d’hébergement doivent être confirmées avec le prestataire et précisées ici. Aucune durée fictive n’est publiée."] },
          { id: "rights", title: "Vos droits", paragraphs: ["Selon les cas, vous pouvez demander accès, rectification, effacement, opposition, limitation ou portabilité, et retirer un consentement donné sans remettre en cause le traitement antérieur. Le contact spécifique de confidentialité reste à fournir dans les informations de l’exploitant.", "Vous pouvez contacter le restaurant par ses moyens publics et adresser une réclamation à l’Agence espagnole de protection des données, sur www.aepd.es, si vous estimez que vos droits ne sont pas respectés."] },
          { id: "external-links", title: "Liens vers d’autres services", paragraphs: ["Google Maps et les réseaux sociaux ne s’ouvrent que lorsque vous cliquez sur leurs liens. Aucune carte ni aucun widget social n’est intégré. Leurs propres politiques s’appliquent lors de votre visite."] },
          { id: "updates", title: "Mise à jour de cette politique", paragraphs: ["Ces informations seront revues en cas de changement des fonctionnalités, prestataires ou données de l’exploitant. La date indique la version publiée."] },
        ],
      },
      cookies: {
        title: "Politique relative aux cookies", intro: "Cette page présente les cookies et technologies similaires du site actuel et explique leur gestion dans votre navigateur.",
        sections: [
          { id: "cookie-use", title: "Utilisation actuelle des cookies", paragraphs: ["Le code du site n’intègre aucun cookie propre d’analyse, de publicité ou d’authentification. Les vérifications de la version publique n’ont pas identifié de cookies de session créés par l’application.", "L’hébergement peut employer des mécanismes techniques de sécurité ou de diffusion selon ses conditions. Tout cookie effectivement ajouté devra être identifié ici avec son fournisseur, sa finalité et sa durée."] },
          { id: "preferences", title: "Langue, recherche et préférences", paragraphs: ["La langue est indiquée dans l’adresse de la page. Filtres, recherche et présentation de la carte sont gérés en mémoire pendant la navigation, sans profil visiteur ni conservation par cookies ou stockage local.", "La mise en cache habituelle du navigateur accélère le chargement des images, polices et pages ; elle ne crée pas de compte ni de session utilisateur."] },
          { id: "third-parties", title: "Services externes", paragraphs: ["Les polices et images proviennent du projet. Les liens vers Maps et les réseaux sociaux n’intègrent pas leurs services dans la page ; leurs cookies et politiques s’appliquent si vous choisissez de les visiter."] },
          { id: "browser-settings", title: "Gestion des cookies", paragraphs: ["Vous pouvez consulter, bloquer ou supprimer cookies et données de sites dans les réglages de confidentialité de Chrome, Safari, Firefox, Edge ou d’un autre navigateur. Les options dépendent du logiciel et de l’appareil.", "Si des cookies non nécessaires sont ajoutés, ils seront décrits et les choix de consentement applicables seront proposés avant leur activation."] },
          { id: "changes", title: "Révision et responsable", paragraphs: ["Cette politique sera actualisée en cas de changement de configuration ou de services. Les informations manquantes sur l’exploitant et les confirmations techniques figurent expressément au début du document."] },
        ],
      },
      "aviso-legal": {
        title: "Mentions légales", intro: "Ces mentions régissent l’accès au site d’information de Taberna Don Juan et son utilisation. L’identification de l’exploitant doit être complétée avec les données réelles indiquées ci-dessous.",
        sections: [
          { id: "purpose", title: "Objet du site", paragraphs: ["Le site présente le restaurant, sa carte, les prix publiés et les moyens de contact. Il ne propose ni conclusion de contrat, ni commande, ni paiement, ni système de réservation en ligne."] },
          { id: "use", title: "Utilisation", paragraphs: ["Vous pouvez consulter les pages et leurs liens de manière licite et respectueuse. Il est interdit de perturber le service, d’introduire du code malveillant ou de porter atteinte aux droits d’autrui."] },
          { id: "menu-information", title: "Informations sur la carte", paragraphs: ["Les prix sont indiqués en euros pour le produit ou le format précisé. La publication d’un plat ne confirme pas sa disponibilité en temps réel et ne permet pas de supposer des quantités, ingrédients ou conditions non indiqués.", "Les informations peuvent être corrigées ou actualisées selon les changements du restaurant. Les moyens de contact publiés permettent de poser des questions sur l’offre précise."] },
          { id: "intellectual-property", title: "Propriété intellectuelle", paragraphs: ["La marque, les textes, photographies, graphismes et autres ressources sont soumis aux droits de leurs titulaires et aux licences applicables. L’accès ne confère aucun droit d’exploitation hors usages autorisés par la loi ou expressément permis."] },
          { id: "external-links", title: "Liens externes", paragraphs: ["Les liens vers cartes et réseaux facilitent l’information et le contact. Leurs destinations ont leurs propres conditions ; un lien ne signifie pas que tous leurs contenus ou services sont contrôlés."] },
          { id: "responsibility", title: "Fonctionnement et responsabilité", paragraphs: ["Des efforts sont faits pour maintenir le site et ses informations disponibles et à jour, mais des incidents ou changements peuvent survenir. Ces mentions ne limitent pas les droits des consommateurs ni les responsabilités qui ne peuvent être exclues légalement."] },
          { id: "applicable-law", title: "Règles applicables et contact", paragraphs: ["L’utilisation relève des règles espagnoles et européennes applicables, notamment des dispositions impératives de protection des consommateurs et de compétence judiciaire. Vous pouvez contacter le restaurant ; l’adresse électronique et l’identification complète restent à fournir."] },
        ],
      },
    },
  },
  ro: {
    updated: "Ultima actualizare", identityTitle: "Identificarea titularului", pendingTitle: "Informații de completat",
    pendingIntro: "Textele descriu site-ul actual. Următoarele date și confirmări sunt necesare înainte de a le considera definitive; nu au fost înlocuite cu informații inventate.",
    pendingValue: "Urmează să fie furnizat", businessTypePending: "Forma juridică a titularului", hostingPending: "Condițiile de găzduire și garanțiile aplicabile transferurilor de date", retentionPending: "Criteriile concrete de păstrare a datelor și jurnalelor tehnice",
    restaurantContact: "Date publice de contact ale restaurantului", pageContents: "Pe această pagină", otherDocuments: "Documente asociate", references: "Informațiile furnizorului și autorității de supraveghere",
    identityFields: { name: "Nume sau denumire juridică", taxId: "Cod de identificare fiscală", registeredAddress: "Adresa titularului", contactEmail: "E-mail de contact și confidențialitate", registryDetails: "Date de înregistrare, dacă este cazul" },
    documents: {
      privacidad: {
        title: "Politica de confidențialitate", intro: "Această politică explică prelucrarea datelor legate de site-ul informativ Taberna Don Juan, meniul și mijloacele de contact publicate.",
        sections: [
          { id: "processing", title: "Date care pot fi prelucrate", paragraphs: ["Site-ul nu are conturi, bază de vizitatori, formulare, plăți sau rezervări online. Căutarea și filtrele funcționează în browser, fără a trimite căutările către un serviciu de analiză.", "Pentru afișarea paginilor și protejarea serviciului, găzduirea poate prelucra date tehnice precum adresa IP, browserul, pagina solicitată, data, ora și informații despre erori. Dacă contactezi restaurantul, datele oferite sunt folosite pentru a răspunde solicitării."] },
          { id: "purposes", title: "Scopuri și temeiuri", paragraphs: ["Datele tehnice susțin afișarea site-ului, remedierea incidentelor și securitatea, pe baza interesului legitim de a furniza un serviciu fiabil. Solicitările sunt tratate pentru a răspunde și, după caz, pentru demersuri precontractuale sau obligații legale.", "Această versiune nu include publicitate personalizată, profilare comercială sau decizii automate cu efecte juridice asupra vizitatorilor."] },
          { id: "hosting", title: "Găzduire, destinatari și transferuri", paragraphs: ["Site-ul este găzduit de Vercel Inc. Furnizorul poate prelucra date tehnice conform propriilor condiții și politici de confidențialitate. Infrastructura sa poate implica prelucrări în afara Spațiului Economic European.", "Titularul trebuie să confirme condițiile contractate, garanțiile de transfer aplicabile planului și furnizorii implicați. Aceste puncte rămân explicit de confirmat; nu se afirmă existența unui contract sau a unei garanții neverificate. Datele pot fi comunicate și când legea impune acest lucru."] },
          { id: "retention", title: "Păstrarea datelor", paragraphs: ["Datele de contact sunt păstrate cât este necesar pentru a răspunde solicitării și, după caz, în termenele legale legate de eventuale răspunderi. Site-ul nu le adaugă la o listă de publicitate.", "Durata și configurarea jurnalelor de găzduire trebuie confirmate cu furnizorul și precizate în această politică. Nu este publicat un termen fictiv."] },
          { id: "rights", title: "Drepturile tale", paragraphs: ["După caz, poți solicita acces, rectificare, ștergere, opoziție, restricționare sau portabilitate și poți retrage un consimțământ anterior fără a afecta prelucrarea trecută. Contactul specific de confidențialitate urmează să fie completat în identificarea titularului.", "Poți folosi mijloacele publice ale restaurantului și poți depune o plângere la Agenția Spaniolă pentru Protecția Datelor, www.aepd.es, dacă apreciezi că drepturile nu au fost respectate."] },
          { id: "external-links", title: "Legături către alte servicii", paragraphs: ["Google Maps și rețelele sociale se deschid numai când apeși linkurile lor. Nu sunt integrate hărți sau widgeturi sociale. La vizitarea acestor servicii se aplică politicile lor proprii."] },
          { id: "updates", title: "Actualizări", paragraphs: ["Informațiile vor fi revizuite când se schimbă funcționalitățile, furnizorii sau datele titularului. Data indică versiunea publicată."] },
        ],
      },
      cookies: {
        title: "Politica privind cookie-urile", intro: "Această pagină explică cookie-urile și tehnologiile similare ale site-ului actual și gestionarea lor în browser.",
        sections: [
          { id: "cookie-use", title: "Utilizarea actuală", paragraphs: ["Codul site-ului nu include cookie-uri proprii de analiză, publicitate sau autentificare. Verificările versiunii publice nu au identificat cookie-uri de sesiune create de aplicație.", "Găzduirea poate folosi mecanisme tehnice de securitate sau livrare conform propriilor condiții. Orice cookie introdus efectiv trebuie identificat aici cu furnizorul, scopul și durata sa."] },
          { id: "preferences", title: "Limbă, căutare și preferințe", paragraphs: ["Limba este indicată în adresa paginii. Filtrele, căutarea și vizualizarea meniului sunt gestionate în memorie în timpul navigării, fără profil de vizitator sau păstrare prin cookie-uri ori stocare locală.", "Cache-ul obișnuit al browserului ajută la încărcarea imaginilor, fonturilor și paginilor; nu creează cont sau sesiune de utilizator."] },
          { id: "third-parties", title: "Servicii externe", paragraphs: ["Fonturile și imaginile sunt servite din proiect. Linkurile Maps și sociale nu integrează serviciile în pagină; cookie-urile și politicile lor se aplică atunci când alegi să le vizitezi."] },
          { id: "browser-settings", title: "Gestionarea cookie-urilor", paragraphs: ["Poți consulta, bloca sau șterge cookie-urile și datele site-urilor din setările de confidențialitate Chrome, Safari, Firefox, Edge sau ale altui browser. Opțiunile diferă după program și dispozitiv.", "Dacă se adaugă cookie-uri neesențiale, vor fi explicate și se vor oferi opțiunile de consimțământ aplicabile înainte de activare."] },
          { id: "changes", title: "Revizuire și titular", paragraphs: ["Politica va fi actualizată dacă se schimbă configurația sau serviciile. Datele lipsă ale titularului și confirmările tehnice sunt indicate explicit la începutul documentului."] },
        ],
      },
      "aviso-legal": {
        title: "Aviz legal", intro: "Acest aviz reglementează accesul și utilizarea site-ului informativ Taberna Don Juan. Identificarea juridică trebuie completată cu datele reale indicate mai jos.",
        sections: [
          { id: "purpose", title: "Scopul site-ului", paragraphs: ["Site-ul prezintă restaurantul, meniul, prețurile publicate și mijloacele de contact. Nu oferă contractare, comenzi, plăți sau rezervări online."] },
          { id: "use", title: "Utilizare", paragraphs: ["Poți consulta paginile și linkurile în mod legal și respectuos. Nu sunt permise perturbarea serviciului, introducerea codului dăunător sau încălcarea drepturilor altor persoane."] },
          { id: "menu-information", title: "Informații despre meniu", paragraphs: ["Prețurile sunt în euro și corespund produsului sau formatului indicat. Publicarea unui preparat nu confirmă disponibilitatea în timp real și nu presupune cantități, ingrediente sau condiții neprecizate.", "Informațiile pot fi actualizate pentru corectarea erorilor sau schimbările restaurantului. Pentru întrebări despre oferta concretă folosește contactele publicate."] },
          { id: "intellectual-property", title: "Proprietate intelectuală", paragraphs: ["Marca, textele, fotografiile, designul și celelalte resurse sunt supuse drepturilor titularilor lor și licențelor aplicabile. Accesul nu acordă drepturi de exploatare în afara utilizărilor permise de lege sau autorizate explicit."] },
          { id: "external-links", title: "Linkuri externe", paragraphs: ["Linkurile către hărți și rețele facilitează informarea și contactul. Destinațiile au condiții proprii; includerea unui link nu înseamnă controlul tuturor conținuturilor ori serviciilor lor."] },
          { id: "responsibility", title: "Funcționare și răspundere", paragraphs: ["Se urmărește menținerea informațiilor și serviciului disponibile și actualizate, însă pot apărea incidente sau schimbări. Acest aviz nu limitează drepturile consumatorilor sau răspunderile care nu pot fi excluse legal."] },
          { id: "applicable-law", title: "Reguli aplicabile și contact", paragraphs: ["Utilizarea este guvernată de normele spaniole și europene aplicabile, inclusiv protecția obligatorie a consumatorilor și regulile de competență judiciară. Poți contacta restaurantul; e-mailul și identificarea completă a titularului urmează să fie furnizate."] },
        ],
      },
    },
  },
};

export const legalCopy: Record<Locale, LegalCopy> = {
  ...translatedLegalCopy,
  es: {
    updated: "Última actualización", identityTitle: "Identificación del titular", pendingTitle: "Información pendiente de completar",
    pendingIntro: "Estos textos describen la web actual. Para considerarlos definitivos, faltan los datos y confirmaciones siguientes; no se han sustituido por información inventada.",
    pendingValue: "Pendiente de facilitar", businessTypePending: "Forma jurídica del titular", hostingPending: "Condiciones de alojamiento y garantías aplicables a las transferencias de datos", retentionPending: "Criterios concretos de conservación de datos y registros técnicos",
    restaurantContact: "Contacto público del restaurante", pageContents: "En esta página", otherDocuments: "Documentos relacionados", references: "Información del proveedor y autoridad de control",
    identityFields: { name: "Nombre o razón social", taxId: "NIF/CIF", registeredAddress: "Domicilio del titular", contactEmail: "Correo de contacto y privacidad", registryDetails: "Datos registrales, si corresponde" },
    documents: {
      privacidad: {
        title: "Política de privacidad",
        intro: "Esta política explica el tratamiento de datos relacionado con la web informativa de Taberna Don Juan, su carta y los medios de contacto publicados.",
        sections: [
          { id: "processing", title: "Qué datos pueden tratarse", paragraphs: ["La web no dispone de cuentas, base de datos de visitantes, formularios, pagos ni reservas en línea. La búsqueda y los filtros funcionan en el navegador y no se envían como consultas a un servicio de analítica.", "Para entregar las páginas y proteger el servicio, la infraestructura de alojamiento puede tratar datos técnicos, como dirección IP, navegador, página solicitada, fecha, hora e información de errores. Si contactas con el restaurante, se tratarán los datos que facilites para atender tu consulta."] },
          { id: "purposes", title: "Finalidades y bases del tratamiento", paragraphs: ["Los datos técnicos se utilizan para servir la web, resolver incidencias y mantener su seguridad, sobre la base del interés legítimo en prestar un servicio fiable. Las consultas se atienden para responder a tu solicitud y, cuando corresponda, realizar gestiones precontractuales o cumplir obligaciones legales.", "Esta versión no incorpora publicidad personalizada, perfiles comerciales ni decisiones automatizadas con efectos jurídicos sobre el visitante."] },
          { id: "hosting", title: "Alojamiento, destinatarios y transferencias", paragraphs: ["La web está alojada en Vercel Inc. El proveedor puede tratar datos técnicos conforme a sus propias condiciones y política de privacidad. Su infraestructura puede implicar tratamientos fuera del Espacio Económico Europeo.", "El titular debe confirmar las condiciones contratadas, las garantías de transferencia que correspondan a su plan y los proveedores que intervengan. Estos puntos se mantienen señalados como pendientes; no se afirma la existencia de un contrato o garantía que no se haya comprobado. También podrán comunicarse datos cuando exista una obligación legal."] },
          { id: "retention", title: "Conservación", paragraphs: ["Los datos de contacto se conservarán durante el tiempo necesario para atender la consulta y, cuando proceda, durante los plazos legales aplicables a posibles responsabilidades. No se añaden a una lista de publicidad desde esta web.", "La duración y configuración de los registros técnicos del alojamiento deben confirmarse con el proveedor y concretarse en esta política. No se publica un plazo ficticio."] },
          { id: "rights", title: "Tus derechos", paragraphs: ["Cuando corresponda, puedes solicitar acceso, rectificación, supresión, oposición, limitación o portabilidad de tus datos, y retirar un consentimiento previamente otorgado sin afectar al tratamiento anterior. El contacto específico de privacidad queda pendiente de incorporar en la identificación del titular.", "Puedes dirigir tus consultas a los medios públicos del restaurante y presentar una reclamación ante la Agencia Española de Protección de Datos, en www.aepd.es, si consideras que tus derechos no han sido atendidos."] },
          { id: "external-links", title: "Enlaces a otros servicios", paragraphs: ["Google Maps y las redes sociales se abren únicamente al pulsar sus enlaces. No se cargan mapas ni widgets sociales incrustados. Al acceder a esos servicios se aplican sus propias políticas de privacidad."] },
          { id: "updates", title: "Actualizaciones de esta política", paragraphs: ["Esta información se revisará cuando cambien las funcionalidades, los proveedores o los datos del titular. La fecha indicada permite conocer la versión publicada."] },
        ],
      },
      cookies: {
        title: "Política de cookies",
        intro: "Esta página describe las cookies y tecnologías similares de la versión actual de la web, y cómo puedes gestionarlas desde tu navegador.",
        sections: [
          { id: "cookie-use", title: "Uso actual de cookies", paragraphs: ["El código de esta web no incorpora cookies propias de analítica, publicidad o autenticación. En las comprobaciones realizadas de la versión pública no se han observado cookies de sesión creadas por la aplicación.", "La infraestructura de alojamiento puede aplicar mecanismos técnicos de seguridad o entrega del servicio conforme a sus condiciones. Cualquier cookie que se incorpore de forma efectiva deberá identificarse aquí con su proveedor, finalidad y duración."] },
          { id: "preferences", title: "Idioma, búsqueda y preferencias", paragraphs: ["El idioma se identifica en la dirección de la página. Los filtros, la búsqueda y la vista de la carta se gestionan en memoria durante la navegación, sin guardarse como un perfil del visitante ni persistirse mediante cookies o almacenamiento local.", "La caché normal de archivos del navegador facilita cargar imágenes, fuentes y páginas; no equivale a crear una cuenta o sesión de usuario."] },
          { id: "third-parties", title: "Servicios externos", paragraphs: ["Las tipografías y las imágenes se sirven desde el propio proyecto. Los enlaces de Maps y redes sociales no insertan sus servicios dentro de la página: sus cookies y políticas se aplicarán cuando decidas visitarlos."] },
          { id: "browser-settings", title: "Cómo gestionar las cookies", paragraphs: ["Puedes consultar, bloquear o eliminar cookies y datos de sitios desde los ajustes de privacidad de Chrome, Safari, Firefox, Edge u otro navegador. Las opciones dependen del programa y del dispositivo.", "Si en el futuro se añaden cookies no necesarias, se informará de ellas y se ofrecerán las opciones de consentimiento que correspondan antes de activarlas."] },
          { id: "changes", title: "Revisión e identificación del responsable", paragraphs: ["Esta política se actualizará si cambian la configuración o los servicios utilizados. Los datos del titular y las condiciones técnicas pendientes figuran de forma expresa al inicio del documento."] },
        ],
      },
      "aviso-legal": {
        title: "Aviso legal",
        intro: "Este aviso regula el acceso y uso de la web informativa de Taberna Don Juan. Su identificación empresarial debe completarse con los datos reales indicados a continuación.",
        sections: [
          { id: "purpose", title: "Objeto de la web", paragraphs: ["La web presenta información del restaurante, su carta, precios publicados y medios de contacto. No incorpora contratación, pedidos, pagos ni un sistema de reservas en línea."] },
          { id: "use", title: "Uso del sitio", paragraphs: ["Puedes consultar las páginas y utilizar sus enlaces de forma lícita y respetuosa. No está permitido intentar alterar el servicio, introducir código dañino o utilizarlo para vulnerar derechos de otras personas."] },
          { id: "menu-information", title: "Información de la carta", paragraphs: ["Los precios se muestran en euros y corresponden al producto o formato indicado. La publicación de un plato no constituye una indicación de disponibilidad en tiempo real ni permite suponer medidas, ingredientes o condiciones que no figuren expresamente.", "La información puede actualizarse para corregir errores o reflejar cambios del restaurante. Para consultas sobre la oferta concreta puedes utilizar los medios de contacto publicados."] },
          { id: "intellectual-property", title: "Propiedad intelectual e industrial", paragraphs: ["La marca, textos, fotografías, diseño y demás recursos están sujetos a los derechos de sus respectivos titulares y a las licencias que correspondan. El acceso no concede derechos de explotación, salvo los usos legalmente permitidos o expresamente autorizados."] },
          { id: "external-links", title: "Enlaces externos", paragraphs: ["Los enlaces a mapas o redes se ofrecen para facilitar información y contacto. Sus destinos tienen condiciones propias; incluir un enlace no supone controlar todos sus contenidos o servicios."] },
          { id: "responsibility", title: "Funcionamiento y responsabilidad", paragraphs: ["Se procura mantener la información y el servicio disponibles y actualizados, aunque pueden producirse incidencias técnicas o cambios de contenido. Este aviso no limita los derechos que correspondan a las personas consumidoras ni las responsabilidades que no puedan excluirse legalmente."] },
          { id: "applicable-law", title: "Normativa aplicable y contacto", paragraphs: ["El uso del sitio se rige por la normativa española y europea que resulte aplicable, respetando las reglas imperativas de protección de consumidores y competencia judicial. Las consultas pueden dirigirse a los medios del restaurante; el correo y la identificación completa del titular quedan pendientes de facilitar."] },
        ],
      },
    },
  },
  en: {
    updated: "Last updated", identityTitle: "Website operator", pendingTitle: "Information still to be completed",
    pendingIntro: "These texts describe the current website. The following details and confirmations are still needed before treating them as final; no invented information has been substituted.",
    pendingValue: "To be supplied", businessTypePending: "Operator’s legal form", hostingPending: "Hosting terms and applicable safeguards for data transfers", retentionPending: "Specific retention criteria for data and technical logs",
    restaurantContact: "Public restaurant contact", pageContents: "On this page", otherDocuments: "Related documents", references: "Provider and supervisory authority information",
    identityFields: { name: "Full name or legal entity", taxId: "Tax identification number", registeredAddress: "Operator’s registered address", contactEmail: "Contact and privacy email", registryDetails: "Registration details, if applicable" },
    documents: {
      privacidad: {
        title: "Privacy policy", intro: "This policy explains data processing connected with the Taberna Don Juan information website, its menu and the published contact channels.",
        sections: [
          { id: "processing", title: "Data that may be processed", paragraphs: ["The website has no accounts, visitor database, forms, payments or online reservations. Search and filters run in the browser and are not sent as queries to an analytics service.", "To deliver pages and protect the service, the hosting infrastructure may process technical data such as IP address, browser, requested page, date, time and error information. If you contact the restaurant, the details you provide will be used to answer your enquiry."] },
          { id: "purposes", title: "Purposes and legal bases", paragraphs: ["Technical data supports website delivery, troubleshooting and security, based on the legitimate interest in providing a reliable service. Enquiries are handled to respond to your request and, where relevant, take pre-contractual steps or meet legal obligations.", "This version does not include personalised advertising, commercial profiling or automated decisions with legal effects on visitors."] },
          { id: "hosting", title: "Hosting, recipients and transfers", paragraphs: ["The website is hosted by Vercel Inc. The provider may process technical data under its own terms and privacy notice. Its infrastructure may involve processing outside the European Economic Area.", "The operator must confirm the contracted terms, transfer safeguards applicable to its plan and the providers involved. These points remain expressly pending; no unverified agreement or safeguard is asserted. Data may also be disclosed where required by law."] },
          { id: "retention", title: "Retention", paragraphs: ["Contact details are kept for the time needed to handle an enquiry and, where applicable, for legally required periods relating to possible liabilities. The website does not add them to an advertising list.", "The duration and configuration of hosting logs must be confirmed with the provider and specified in this policy. No fictional retention period is published."] },
          { id: "rights", title: "Your rights", paragraphs: ["Where applicable, you may request access, correction, deletion, objection, restriction or portability, and withdraw previously given consent without affecting earlier processing. The dedicated privacy contact remains to be supplied in the operator details.", "You may use the restaurant’s public contact channels for enquiries and lodge a complaint with the Spanish Data Protection Agency at www.aepd.es if you believe your rights have not been respected."] },
          { id: "external-links", title: "Links to other services", paragraphs: ["Google Maps and social networks open only when you click their links. No maps or social widgets are embedded. Their own privacy policies apply when you visit those services."] },
          { id: "updates", title: "Policy updates", paragraphs: ["This information will be reviewed when features, providers or operator details change. The displayed date identifies the published version."] },
        ],
      },
      cookies: {
        title: "Cookie policy", intro: "This page explains cookies and similar technologies in the current website and how to manage them through your browser.",
        sections: [
          { id: "cookie-use", title: "Current cookie use", paragraphs: ["The website code does not include its own analytics, advertising or authentication cookies. Checks of the public version have not identified session cookies created by the application.", "The hosting infrastructure may use technical security or delivery mechanisms under its own terms. Any cookie actually introduced must be identified here with its provider, purpose and duration."] },
          { id: "preferences", title: "Language, search and preferences", paragraphs: ["The page address identifies the language. Filters, search and menu view are managed in memory while browsing, without creating a visitor profile or persisting through cookies or local storage.", "Normal browser file caching helps load images, fonts and pages; it does not create a user account or session."] },
          { id: "third-parties", title: "External services", paragraphs: ["Fonts and images are served from the project itself. Maps and social links do not embed their services in the page; their cookies and policies apply when you choose to visit them."] },
          { id: "browser-settings", title: "Managing cookies", paragraphs: ["You can inspect, block or delete cookies and site data in the privacy settings of Chrome, Safari, Firefox, Edge or another browser. Options vary by browser and device.", "If non-essential cookies are added in the future, they will be explained and the applicable consent choices offered before activation."] },
          { id: "changes", title: "Review and operator identification", paragraphs: ["This policy will be updated if the configuration or services change. Missing operator details and technical confirmations are expressly listed at the start of the document."] },
        ],
      },
      "aviso-legal": {
        title: "Legal notice", intro: "This notice governs access to and use of the Taberna Don Juan information website. Its business identification must be completed with the actual details listed below.",
        sections: [
          { id: "purpose", title: "Purpose of the website", paragraphs: ["The website presents restaurant information, its menu, published prices and contact channels. It does not provide online contracting, ordering, payments or a reservation system."] },
          { id: "use", title: "Website use", paragraphs: ["You may browse the pages and use their links lawfully and respectfully. Attempts to disrupt the service, introduce harmful code or infringe other people’s rights are not permitted."] },
          { id: "menu-information", title: "Menu information", paragraphs: ["Prices are shown in euros and refer to the indicated product or serving label. Publishing a dish does not confirm real-time availability or imply measures, ingredients or conditions not expressly stated.", "Information may be updated to correct errors or reflect restaurant changes. Please use the published contact channels for questions about the specific offering."] },
          { id: "intellectual-property", title: "Intellectual property", paragraphs: ["The brand, text, photographs, design and other materials are subject to their respective owners’ rights and applicable licences. Access grants no exploitation rights beyond legally permitted or expressly authorised uses."] },
          { id: "external-links", title: "External links", paragraphs: ["Map and social links facilitate information and contact. Their destinations have separate terms; including a link does not mean controlling all of their content or services."] },
          { id: "responsibility", title: "Operation and responsibility", paragraphs: ["Efforts are made to keep information and service available and current, although technical incidents and content changes may occur. This notice does not limit consumer rights or liabilities that cannot lawfully be excluded."] },
          { id: "applicable-law", title: "Applicable rules and contact", paragraphs: ["Website use is subject to applicable Spanish and European rules, including mandatory consumer protection and jurisdiction rules. Enquiries may use the restaurant’s contact channels; the email and full operator identification remain to be supplied."] },
        ],
      },
    },
  },
};
