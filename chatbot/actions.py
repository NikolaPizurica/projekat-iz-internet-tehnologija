# Custom Actions

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import wikipedia

import random

# Run Commands
# Start the Model
#   $   rasa run -m models --enable-api --cors "*" --debug
# Start the Actions Server
#   $   rasa run actions

class ActionAskForName(Action):
    """
        This class implements the ask for name portion of the Bot's conversation.
    """

    def __init__(self):
        # Count Session name requests, to avoid NLU errors.
        self.ask_count = 0

        # Diversify the bot output.
        self.d = ['Ko si ti?',
                  'Kako se zoveš?',
                  'Ti si?']

        # Use filler responses in case of an NLU error.
        self.filler = ['Nije svaki dan Badnji dan..',
                       'A kako kad toga nema u pustinji?',
                       'Kruška ne pada daleko od drveta..',
                       'Boli me uvo',
                       'A šta to veliš jadan?',
                       'A ne no burek',
                       'Nema leba bez motike..']

    def name(self) -> Text:
        return "action_ask_for_name"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Increment the ask counter
        self.ask_count += 1
        print("Ask count: ", self.ask_count)

        if self.ask_count > 1:
           # Already asked for name, respond with Filler message.
           dispatcher.utter_message(text=self.filler[random.randint(0, len(self.filler)-1)])
           return []

        # Ask for name
        dispatcher.utter_message(text=self.d[random.randint(0, len(self.d)-1)])
        return []



class ActionHelloWorld(Action):
    """
        This class implements the Introduction portion of the Bot's conversation.
    """

    def __init__(self):
        # Count Session introductions, to avoid NLU errors.
        self.intro_count = 0

        # Diversify the bot output.
        self.d = ['Šta se radi?',
                  'Šta ima?',
                  'Kako ide?']

        # Use filler responses in case of an NLU error.
        self.filler = ['Nije svaki dan Badnji dan..',
                       'A kako kad toga nema u pustinji?',
                       'Kruška ne pada daleko od drveta..',
                       'Boli me uvo',
                       'A šta to veliš jadan?',
                       'A ne no burek',
                       'Nema leba bez motike..']

    def name(self) -> Text:
        return "action_hello_world"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Increment the intro counter
        self.intro_count += 1
        print("Intro count: ", self.intro_count)
        print(tracker.latest_message['entities'])

        # We have already received a name in this Session, use a Filler response.
        if self.intro_count > 1:
           dispatcher.utter_message(text=self.filler[random.randint(0, len(self.filler)-1)])
           return []


        # Fetch the user name from the tracker.
        name = self.apply_transformation(tracker.get_slot('names'))

        print(name)

        dispatcher.utter_message(text="Zdravo {0}, ja sam Šćepče Aić. {1}".format(name, self.d[random.randint(0, len(self.d)-1)]))

        return []

    def apply_transformation(self, name: str) -> str:
        """
        :param name: The word that is to be transformed.
        :return: The transformed word.
        """

        if name[-1] in ('a', 'e', 'i', 'o', 'u'):
            return name
        # if it ends in ar, apply the specific rule
        if name[:-2] == 'ar':
            return name[:-2] + 're'
        # If it is a consonant, then apply the rule
        return name + 'e'


class ActionFetchInfo(Action):
    """
        This class implements the Info-Fetching functionality of the Bot.
    """
    def __init__(self):
        self.filler = ['Što znam ja',
                       'Pojma nemam',
                       'Veze nemam',
                       'Dobro pitanje',
                       'Hmmmm']
    def name(self) -> Text:
        return "action_fetch_info"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        # Fetch the search term from the tracker.
        term = tracker.get_slot('search_terms')

        print(term)

        # Do a wiki search and utter the first sentence
        wikipedia.set_lang("hr")

        # In case of an API error, use this as a fallback.
        search = self.filler[random.randint(0, len(self.filler)-1)]
        try:
            search = self.first_sentence(wikipedia.summary(term))
        except:
            pass

        dispatcher.utter_message(text=search)

        return []

    def first_sentence(self, txt: str) -> str:
        """
        :param txt: The Search Results.
        :return: More human readable Search Results.
        """
        #return txt[:len(txt)//3] + '... Nisam ti ja enciklopedija, idi pa istražuj.'
        return txt[:len(txt) // 3] + '...'


    def apply_transformation(self, word: str) -> str:
        """
        :param str: The String to be Transformed.
        :return: Transformed String.
        """
        # Americi -> Amerika
        # Evropi -> Evropa
        # Vikinzima -> Vikinzi
        # Kopakabani -> Kopakabana
        # Mravima -> Mravi

        # If plural and ends in 'ma', just remove the last two letters.
        # Susceptible to bugs
        if word[-2:] == 'ma':
            word = word[:-2]

        # If singular and ends with 'i', replace with 'a'
        if word[-1] == 'i':
            word = word[:-1] + 'a'
            # If the penultimate letter is 'c', apply c -> k transformation
            if word[-2] == 'c':
                word = word[:-2] + 'ka'

        if not word.index(' '):
            return word

        # Handle two-part Search Terms (such as names)

        # Isolate the words
        blank_ind = word.index(' ')
        word1 = word[0: blank_ind]
        word2 = word[blank_ind + 1: -1]

        # Albertu Ajnstajnu
        # Flojdu Mejveteru
        # Hermioni Grejndzer
        # Eduardu Maneu

        # Isolate the words

        # Temporary Solution (susceptible to bugs)
        if word1[-1] == 'u':
            word1 = word1[:-1]  # Cut off the last letter
        if word2[-1] == 'u':
            word2 = word2[:-1]  # Cut off the last letter

        if word1[-1] == 'i':
            word1 = word1[:-1] + 'a'

        # Merge the strings
        word = word1 + ' ' + word2

        return word


class ActionTellJoke(Action):
    """
        This class implements the joke telling functionality of the Bot.
    """
    def __init__(self):
        # Jokes
        self.jokes = ['Idu dva psa ulicom. Jedan se češka a drugi se slovačka.',
                      'U našoj državi je svejedno gdje se nalaziš. Uvjek si na mjestu nesreće.',
                      'Zasto plavusa izlazi napolje kad grmi? - Zato što misli da je bog slika.',
                      'Zašto Bog ne voli Amerikance? - Zato što ga zovu Gad!',
                      'Kako se zove medvjed koji trenira Kung fu? -Griz li.',
                      'Kako se zove crnogorski ronilački klub? - Đe-ronimo!',
                      'Čak Noris je upao na budžet na privatnom fakultetu.',
                      'Kako se na moru zovu komarci? - Nikako, sami dođu.',
                      'Sta kaze ljudozder kad vidi trudnicu? - Kinder surprise!',
                      'Idu dve dlake ulicom. - Jednu zgazi auto, a drugu za dlaku!']
    def name(self) -> Text:
        return "action_tell_joke"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        k = random.randint(0, len(self.jokes) - 1)
        # Fetch a joke
        joke = self.jokes[k]
        # Don't repeat the same joke twice in a session.
        if len(self.jokes) > 1:
            self.jokes.remove(self.jokes[k])

        print("Sending Attachment")
        dispatcher.utter_message(attachment="https://i.imgur.com/nGF1K8f.jpg")

        dispatcher.utter_message(text=joke)

        return []