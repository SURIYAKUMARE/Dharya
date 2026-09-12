import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Smile,
  Heart,
  ThumbsUp,
  PawPrint,
  Utensils,
  Trophy,
  Car,
  Lightbulb,
  Hash,
  Flag,
  Delete,
  Search,
  X,
  Clock
} from 'lucide-react';
import { EmojiSvg } from './EmojiSvg';

interface EmojiCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  emojis: { char: string; name: string }[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    icon: <Smile className="w-4 h-4" />,
    emojis: [
      { char: '😀', name: 'grinning face' },
      { char: '😃', name: 'grinning face with big eyes' },
      { char: '😄', name: 'grinning face with smiling eyes' },
      { char: '😁', name: 'beaming face with smiling eyes' },
      { char: '😆', name: 'grinning squinting face' },
      { char: '😅', name: 'grinning face with sweat' },
      { char: '🤣', name: 'rolling on the floor laughing' },
      { char: '😂', name: 'face with tears of joy' },
      { char: '🙂', name: 'slightly smiling face' },
      { char: '🙃', name: 'upside-down face' },
      { char: '😉', name: 'winking face' },
      { char: '😊', name: 'smiling face with smiling eyes' },
      { char: '😇', name: 'smiling face with halo' },
      { char: '🥰', name: 'smiling face with hearts' },
      { char: '😍', name: 'smiling face with heart-eyes' },
      { char: '🤩', name: 'star-struck' },
      { char: '😘', name: 'face blowing a kiss' },
      { char: '😗', name: 'kissing face' },
      { char: '😚', name: 'kissing face with closed eyes' },
      { char: '😙', name: 'kissing face with smiling eyes' },
      { char: '😋', name: 'face savoring food' },
      { char: '😛', name: 'face with tongue' },
      { char: '😜', name: 'winking face with tongue' },
      { char: '🤪', name: 'zany face' },
      { char: '😝', name: 'squinting face with tongue' },
      { char: '🤑', name: 'money-mouth face' },
      { char: '🤗', name: 'smiling face with open hands' },
      { char: '🤭', name: 'face with hand over mouth' },
      { char: '🤫', name: 'shushing face' },
      { char: '🤔', name: 'thinking face' },
      { char: '🤐', name: 'zipper-mouth face' },
      { char: '🤨', name: 'face with raised eyebrow' },
      { char: '😐', name: 'neutral face' },
      { char: '😑', name: 'expressionless face' },
      { char: '😶', name: 'face without mouth' },
      { char: '😏', name: 'smirking face' },
      { char: '😒', name: 'unamused face' },
      { char: '🙄', name: 'face with rolling eyes' },
      { char: '😬', name: 'grimacing face' },
      { char: '🤥', name: 'lying face' },
      { char: '😌', name: 'relieved face' },
      { char: '😔', name: 'pensive face' },
      { char: '😪', name: 'sleepy face' },
      { char: '🤤', name: 'drooling face' },
      { char: '😴', name: 'sleeping face' },
      { char: '😷', name: 'face with medical mask' },
      { char: '🤒', name: 'face with thermometer' },
      { char: '🤕', name: 'face with head-bandage' },
      { char: '🤢', name: 'nauseated face' },
      { char: '🤮', name: 'face vomiting' },
      { char: '🤧', name: 'sneezing face' },
      { char: '🥵', name: 'hot face' },
      { char: '🥶', name: 'cold face' },
      { char: '🥴', name: 'woozy face' },
      { char: '😵', name: 'face with crossed-out eyes' },
      { char: '🤯', name: 'exploding head' },
      { char: '🤠', name: 'cowboy hat face' },
      { char: '🥳', name: 'partying face' },
      { char: '🥸', name: 'disguised face' },
      { char: '😎', name: 'smiling face with sunglasses' },
      { char: '🤓', name: 'nerd face' },
      { char: '🧐', name: 'face with monocle' },
      { char: '😕', name: 'confused face' },
      { char: '😟', name: 'worried face' },
      { char: '🙁', name: 'slightly frowning face' },
      { char: '😮', name: 'face with open mouth' },
      { char: '😯', name: 'hushed face' },
      { char: '😲', name: 'astonished face' },
      { char: '😳', name: 'flushed face' },
      { char: '🥺', name: 'pleading face' },
      { char: '😦', name: 'frowning face with open mouth' },
      { char: '😧', name: 'anguished face' },
      { char: '😨', name: 'fearful face' },
      { char: '😰', name: 'anxious face with sweat' },
      { char: '😥', name: 'sad but relieved face' },
      { char: '😢', name: 'crying face' },
      { char: '😭', name: 'loudly crying face' },
      { char: '😱', name: 'face screaming in fear' },
      { char: '😖', name: 'confounded face' },
      { char: '😣', name: 'persevering face' },
      { char: '😞', name: 'disappointed face' },
      { char: '😓', name: 'downcast face with sweat' },
      { char: '😩', name: 'weary face' },
      { char: '😫', name: 'tired face' },
      { char: '🥱', name: 'yawning face' },
      { char: '😤', name: 'face with steam from nose' },
      { char: '😡', name: 'enraged face' },
      { char: '😠', name: 'angry face' },
      { char: '🤬', name: 'face with symbols on mouth' },
      { char: '😈', name: 'smiling face with horns' },
      { char: '👿', name: 'angry face with horns' },
      { char: '💀', name: 'skull' },
      { char: '☠️', name: 'skull and crossbones' },
      { char: '💩', name: 'pile of poo' },
      { char: '🤡', name: 'clown face' },
      { char: '👹', name: 'ogre' },
      { char: '👺', name: 'goblin' },
      { char: '👻', name: 'ghost' },
      { char: '👽', name: 'alien' },
      { char: '👾', name: 'alien monster' },
      { char: '🤖', name: 'robot' },
    ],
  },
  {
    id: 'love',
    name: 'Love & Hearts',
    icon: <Heart className="w-4 h-4" />,
    emojis: [
      { char: '❤️', name: 'red heart' },
      { char: '🧡', name: 'orange heart' },
      { char: '💛', name: 'yellow heart' },
      { char: '💚', name: 'green heart' },
      { char: '💙', name: 'blue heart' },
      { char: '💜', name: 'purple heart' },
      { char: '🖤', name: 'black heart' },
      { char: '🤍', name: 'white heart' },
      { char: '🤎', name: 'brown heart' },
      { char: '💔', name: 'broken heart' },
      { char: '❣️', name: 'heart exclamation' },
      { char: '💕', name: 'two hearts' },
      { char: '💞', name: 'revolving hearts' },
      { char: '💓', name: 'beating heart' },
      { char: '💗', name: 'growing heart' },
      { char: '💖', name: 'sparkling heart' },
      { char: '💘', name: 'heart with arrow' },
      { char: '💝', name: 'heart with ribbon' },
      { char: '💟', name: 'heart decoration' },
      { char: '💌', name: 'love letter' },
      { char: '💋', name: 'kiss mark' },
      { char: '🫂', name: 'people hugging' },
    ],
  },
  {
    id: 'people',
    name: 'Gestures & People',
    icon: <ThumbsUp className="w-4 h-4" />,
    emojis: [
      { char: '👋', name: 'waving hand' },
      { char: '🤚', name: 'raised back of hand' },
      { char: '🖐️', name: 'hand with fingers splayed' },
      { char: '✋', name: 'raised hand' },
      { char: '🖖', name: 'vulcan salute' },
      { char: '👌', name: 'OK hand' },
      { char: '🤌', name: 'pinched fingers' },
      { char: '🤏', name: 'pinching hand' },
      { char: '✌️', name: 'victory hand' },
      { char: '🤞', name: 'crossed fingers' },
      { char: '🫰', name: 'hand with index finger and thumb crossed' },
      { char: '🤟', name: 'love-you gesture' },
      { char: '🤘', name: 'sign of the horns' },
      { char: '🤙', name: 'call me hand' },
      { char: '👈', name: 'backhand index pointing left' },
      { char: '👉', name: 'backhand index pointing right' },
      { char: '👆', name: 'backhand index pointing up' },
      { char: '🖕', name: 'middle finger' },
      { char: '👇', name: 'backhand index pointing down' },
      { char: '☝️', name: 'index pointing up' },
      { char: '🫵', name: 'index pointing at the viewer' },
      { char: '👍', name: 'thumbs up' },
      { char: '👎', name: 'thumbs down' },
      { char: '✊', name: 'raised fist' },
      { char: '👊', name: 'oncoming fist' },
      { char: '🤛', name: 'left-facing fist' },
      { char: '🤜', name: 'right-facing fist' },
      { char: '👏', name: 'clapping hands' },
      { char: '🙌', name: 'raising hands' },
      { char: '🫶', name: 'heart hands' },
      { char: '👐', name: 'open hands' },
      { char: '🤲', name: 'palms up together' },
      { char: '🤝', name: 'handshake' },
      { char: '🙏', name: 'folded hands' },
      { char: '✍️', name: 'writing hand' },
      { char: '💅', name: 'nail polish' },
      { char: '🤳', name: 'selfie' },
      { char: '💪', name: 'flexed biceps' },
      { char: '🦵', name: 'mechanical leg' },
      { char: '🦶', name: 'foot' },
      { char: '👂', name: 'ear' },
      { char: '👃', name: 'nose' },
      { char: '🧠', name: 'brain' },
      { char: '👀', name: 'eyes' },
      { char: '👁️', name: 'eye' },
      { char: '👅', name: 'tongue' },
      { char: '👄', name: 'mouth' },
      { char: '👶', name: 'baby' },
      { char: '👧', name: 'girl' },
      { char: '🧒', name: 'child' },
      { char: '👦', name: 'boy' },
      { char: '👩', name: 'woman' },
      { char: '🧑', name: 'person' },
      { char: '👨', name: 'man' },
      { char: '👱', name: 'person with blond hair' },
      { char: '🧔', name: 'person with beard' },
      { char: '👵', name: 'old woman' },
      { char: '👴', name: 'old man' },
      { char: '👮', name: 'police officer' },
      { char: '🕵️', name: 'detective' },
      { char: '💂', name: 'guard' },
      { char: '👷', name: 'construction worker' },
      { char: '🤴', name: 'prince' },
      { char: '👸', name: 'princess' },
      { char: '👳', name: 'person wearing turban' },
      { char: '🧕', name: 'woman with headscarf' },
      { char: '🤵', name: 'person in tuxedo' },
      { char: '👰', name: 'person with veil' },
      { char: '👼', name: 'baby angel' },
      { char: '🎅', name: 'Santa Claus' },
      { char: '🧙', name: 'mage' },
      { char: '🧚', name: 'fairy' },
      { char: '🧛', name: 'vampire' },
      { char: '🧜', name: 'merperson' },
      { char: '🧝', name: 'elf' },
      { char: '🧞', name: 'genie' },
      { char: '🧟', name: 'zombie' },
      { char: '💃', name: 'woman dancing' },
      { char: '🕺', name: 'man dancing' },
      { char: '🏃', name: 'person running' },
      { char: '🚶', name: 'person walking' },
      { char: '🧘', name: 'person in lotus position' },
    ],
  },
  {
    id: 'animals',
    name: 'Animals & Nature',
    icon: <PawPrint className="w-4 h-4" />,
    emojis: [
      { char: '🐶', name: 'dog face' },
      { char: '🐱', name: 'cat face' },
      { char: '🐭', name: 'mouse face' },
      { char: '🐹', name: 'hamster face' },
      { char: '🐰', name: 'rabbit face' },
      { char: '🦊', name: 'fox face' },
      { char: '🐻', name: 'bear face' },
      { char: '🐼', name: 'panda face' },
      { char: '🐻‍❄️', name: 'polar bear' },
      { char: '🐨', name: 'koala' },
      { char: '🐯', name: 'tiger face' },
      { char: '🦁', name: 'lion face' },
      { char: '🐮', name: 'cow face' },
      { char: '🐷', name: 'pig face' },
      { char: '🐸', name: 'frog' },
      { char: '🐵', name: 'monkey face' },
      { char: '🙈', name: 'see-no-evil monkey' },
      { char: '🙉', name: 'hear-no-evil monkey' },
      { char: '🙊', name: 'speak-no-evil monkey' },
      { char: '🐒', name: 'monkey' },
      { char: '🐔', name: 'chicken' },
      { char: '🐧', name: 'penguin' },
      { char: '🐦', name: 'bird' },
      { char: '🐤', name: 'baby chick' },
      { char: '🦆', name: 'duck' },
      { char: '🦅', name: 'eagle' },
      { char: '🦉', name: 'owl' },
      { char: '🦇', name: 'bat' },
      { char: '🐺', name: 'wolf' },
      { char: '🐗', name: 'boar' },
      { char: '🐴', name: 'horse face' },
      { char: '🦄', name: 'unicorn' },
      { char: '🐝', name: 'honeybee' },
      { char: '🐛', name: 'bug' },
      { char: '🦋', name: 'butterfly' },
      { char: '🐌', name: 'snail' },
      { char: '🐞', name: 'lady beetle' },
      { char: '🐜', name: 'ant' },
      { char: '🦟', name: 'mosquito' },
      { char: '🦗', name: 'cricket' },
      { char: '🕷️', name: 'spider' },
      { char: '🦂', name: 'scorpion' },
      { char: '🐢', name: 'turtle' },
      { char: '🐍', name: 'snake' },
      { char: '🦎', name: 'lizard' },
      { char: '🐙', name: 'octopus' },
      { char: '🦑', name: 'squid' },
      { char: '🦐', name: 'shrimp' },
      { char: '🦞', name: 'lobster' },
      { char: '🦀', name: 'crab' },
      { char: '🐡', name: 'blowfish' },
      { char: '🐠', name: 'tropical fish' },
      { char: '🐟', name: 'fish' },
      { char: '🐬', name: 'dolphin' },
      { char: '🐳', name: 'spouting whale' },
      { char: '🦈', name: 'shark' },
      { char: '🐊', name: 'crocodile' },
      { char: '🐅', name: 'tiger' },
      { char: '🐆', name: 'leopard' },
      { char: '🐘', name: 'elephant' },
      { char: '🦏', name: 'rhinoceros' },
      { char: '🦛', name: 'hippopotamus' },
      { char: '🐪', name: 'camel' },
      { char: '🦒', name: 'giraffe' },
      { char: '🦘', name: 'kangaroo' },
      { char: '🐕', name: 'dog' },
      { char: '🐈', name: 'cat' },
      { char: '🐓', name: 'rooster' },
      { char: '🦚', name: 'peacock' },
      { char: '🦜', name: 'parrot' },
      { char: '🦢', name: 'swan' },
      { char: '🦩', name: 'flamingo' },
      { char: '🕊️', name: 'dove' },
      { char: '🐇', name: 'rabbit' },
      { char: '🦝', name: 'raccoon' },
      { char: '🦡', name: 'badger' },
      { char: '🦦', name: 'otter' },
      { char: '🦥', name: 'sloth' },
      { char: '🐁', name: 'mouse' },
      { char: '🐿️', name: 'chipmunk' },
      { char: '🦔', name: 'hedgehog' },
      { char: '🐉', name: 'dragon' },
      { char: '🌵', name: 'cactus' },
      { char: '🎄', name: 'Christmas tree' },
      { char: '🌲', name: 'evergreen tree' },
      { char: '🌳', name: 'deciduous tree' },
      { char: '🌴', name: 'palm tree' },
      { char: '🌱', name: 'seedling' },
      { char: '🌿', name: 'herb' },
      { char: '☘️', name: 'shamrock' },
      { char: '🍀', name: 'four leaf clover' },
      { char: '🎍', name: 'pine decoration' },
      { char: '🪴', name: 'potted plant' },
      { char: '🎋', name: 'tanabata tree' },
      { char: '🍃', name: 'leaf fluttering in wind' },
      { char: '🍂', name: 'fallen leaf' },
      { char: '🍁', name: 'maple leaf' },
      { char: '🍄', name: 'mushroom' },
      { char: '🌾', name: 'sheaf of rice' },
      { char: '💐', name: 'bouquet' },
      { char: '🌷', name: 'tulip' },
      { char: '🌹', name: 'rose' },
      { char: '🥀', name: 'wilted flower' },
      { char: '🌺', name: 'hibiscus' },
      { char: '🌸', name: 'cherry blossom' },
      { char: '🌼', name: 'blossom' },
      { char: '🌻', name: 'sunflower' },
      { char: '🌞', name: 'sun with face' },
      { char: '🌝', name: 'full moon with face' },
      { char: '🌙', name: 'crescent moon' },
      { char: '⭐️', name: 'star' },
      { char: '🌟', name: 'glowing star' },
      { char: '✨', name: 'sparkles' },
      { char: '⚡️', name: 'high voltage' },
      { char: '💥', name: 'collision' },
      { char: '🔥', name: 'fire' },
      { char: '🌈', name: 'rainbow' },
      { char: '☀️', name: 'sun' },
      { char: '🌤️', name: 'sun behind small cloud' },
      { char: '⛅️', name: 'sun behind cloud' },
      { char: '🌧️', name: 'cloud with rain' },
      { char: '🌩️', name: 'cloud with lightning' },
      { char: '❄️', name: 'snowflake' },
      { char: '☃️', name: 'snowman' },
      { char: '💨', name: 'dashing away' },
      { char: '💧', name: 'droplet' },
      { char: '💦', name: 'sweat droplets' },
      { char: '🌊', name: 'water wave' },
    ],
  },
  {
    id: 'food',
    name: 'Food & Drink',
    icon: <Utensils className="w-4 h-4" />,
    emojis: [
      { char: '🍏', name: 'green apple' },
      { char: '🍎', name: 'red apple' },
      { char: '🍐', name: 'pear' },
      { char: '🍊', name: 'tangerine' },
      { char: '🍋', name: 'lemon' },
      { char: '🍌', name: 'banana' },
      { char: '🍉', name: 'watermelon' },
      { char: '🍇', name: 'grapes' },
      { char: '🍓', name: 'strawberry' },
      { char: '🫐', name: 'blueberries' },
      { char: '🍈', name: 'melon' },
      { char: '🍒', name: 'cherries' },
      { char: '🍑', name: 'peach' },
      { char: '🥭', name: 'mango' },
      { char: '🍍', name: 'pineapple' },
      { char: '🥥', name: 'coconut' },
      { char: '🥝', name: 'kiwi fruit' },
      { char: '🍅', name: 'tomato' },
      { char: '🍆', name: 'eggplant' },
      { char: '🥑', name: 'avocado' },
      { char: '🥦', name: 'broccoli' },
      { char: '🥒', name: 'cucumber' },
      { char: '🌶️', name: 'hot pepper' },
      { char: '🌽', name: 'ear of corn' },
      { char: '🥕', name: 'carrot' },
      { char: '🧄', name: 'garlic' },
      { char: '🧅', name: 'onion' },
      { char: '🥔', name: 'potato' },
      { char: '🥐', name: 'croissant' },
      { char: '🥯', name: 'bagel' },
      { char: '🍞', name: 'bread' },
      { char: '🥖', name: 'baguette bread' },
      { char: '🥨', name: 'pretzel' },
      { char: '🧀', name: 'cheese wedge' },
      { char: '🥚', name: 'egg' },
      { char: '🍳', name: 'cooking' },
      { char: '🥞', name: 'pancakes' },
      { char: '🧇', name: 'waffle' },
      { char: '🥓', name: 'bacon' },
      { char: '🍗', name: 'poultry leg' },
      { char: '🍖', name: 'meat on bone' },
      { char: '🌭', name: 'hot dog' },
      { char: '🍔', name: 'hamburger' },
      { char: '🍟', name: 'french fries' },
      { char: '🍕', name: 'pizza' },
      { char: '🥪', name: 'sandwich' },
      { char: '🥙', name: 'stuffed flatbread' },
      { char: '🌮', name: 'taco' },
      { char: '🌯', name: 'burrito' },
      { char: '🥗', name: 'green salad' },
      { char: '🍝', name: 'spaghetti' },
      { char: '🍜', name: 'steaming bowl' },
      { char: '🍲', name: 'pot of food' },
      { char: '🍛', name: 'curry rice' },
      { char: '🍣', name: 'sushi' },
      { char: '🍱', name: 'bento box' },
      { char: '🥟', name: 'dumpling' },
      { char: '🍤', name: 'fried shrimp' },
      { char: '🍙', name: 'rice ball' },
      { char: '🍚', name: 'cooked rice' },
      { char: '🍦', name: 'soft ice cream' },
      { char: '🍧', name: 'shaved ice' },
      { char: '🍨', name: 'ice cream' },
      { char: '🍩', name: 'doughnut' },
      { char: '🍪', name: 'cookie' },
      { char: '🎂', name: 'birthday cake' },
      { char: '🍰', name: 'shortcake' },
      { char: '🧁', name: 'cupcake' },
      { char: '🥧', name: 'pie' },
      { char: '🍫', name: 'chocolate bar' },
      { char: '🍬', name: 'candy' },
      { char: '🍭', name: 'lollipop' },
      { char: '🍮', name: 'custard' },
      { char: '🍯', name: 'honey pot' },
      { char: '🍼', name: 'baby bottle' },
      { char: '🥛', name: 'glass of milk' },
      { char: '☕️', name: 'hot beverage' },
      { char: '🫖', name: 'teapot' },
      { char: '🍵', name: 'teacup without handle' },
      { char: '🧃', name: 'beverage box' },
      { char: '🥤', name: 'cup with straw' },
      { char: '🧋', name: 'bubble tea' },
      { char: '🍺', name: 'beer mug' },
      { char: '🍻', name: 'clinking beer mugs' },
      { char: '🥂', name: 'clinking glasses' },
      { char: '🍷', name: 'wine glass' },
      { char: '🥃', name: 'tumbler glass' },
      { char: '🍸', name: 'cocktail glass' },
      { char: '🍹', name: 'tropical drink' },
      { char: '🍾', name: 'bottle with popping cork' },
      { char: '🍿', name: 'popcorn' },
    ],
  },
  {
    id: 'activity',
    name: 'Activities & Sports',
    icon: <Trophy className="w-4 h-4" />,
    emojis: [
      { char: '⚽️', name: 'soccer ball' },
      { char: '🏀', name: 'basketball' },
      { char: '🏈', name: 'american football' },
      { char: '⚾️', name: 'baseball' },
      { char: '🥎', name: 'softball' },
      { char: '🎾', name: 'tennis' },
      { char: '🏐', name: 'volleyball' },
      { char: '🏉', name: 'rugby football' },
      { char: '🥏', name: 'flying disc' },
      { char: '🎱', name: 'pool 8 ball' },
      { char: '🏓', name: 'ping pong' },
      { char: '🏸', name: 'badminton' },
      { char: '🏒', name: 'ice hockey' },
      { char: '🏏', name: 'cricket game' },
      { char: '⛳️', name: 'flag in hole' },
      { char: '🏹', name: 'bow and arrow' },
      { char: '🎣', name: 'fishing pole' },
      { char: '🥊', name: 'boxing glove' },
      { char: '🥋', name: 'martial arts uniform' },
      { char: '🛹', name: 'skateboard' },
      { char: '🛼', name: 'roller skate' },
      { char: '⛷️', name: 'skier' },
      { char: '🏂', name: 'snowboarder' },
      { char: '🏋️', name: 'person lifting weights' },
      { char: '🤸', name: 'person cartwheeling' },
      { char: '🏆', name: 'trophy' },
      { char: '🥇', name: '1st place medal' },
      { char: '🥈', name: '2nd place medal' },
      { char: '🥉', name: '3rd place medal' },
      { char: '🏅', name: 'sports medal' },
      { char: '🎖️', name: 'military medal' },
      { char: '🎫', name: 'ticket' },
      { char: '🎟️', name: 'admission tickets' },
      { char: '🎪', name: 'circus tent' },
      { char: '🎭', name: 'performing arts' },
      { char: '🎨', name: 'artist palette' },
      { char: '🎬', name: 'clapper board' },
      { char: '🎤', name: 'microphone' },
      { char: '🎧', name: 'headphone' },
      { char: '🎼', name: 'musical score' },
      { char: '🎹', name: 'musical keyboard' },
      { char: '🥁', name: 'drum' },
      { char: '🎷', name: 'saxophone' },
      { char: '🎺', name: 'trumpet' },
      { char: '🎸', name: 'guitar' },
      { char: '🎻', name: 'violin' },
      { char: '🎲', name: 'game die' },
      { char: '♟️', name: 'chess pawn' },
      { char: '🎯', name: 'bullseye' },
      { char: '🎳', name: 'bowling' },
      { char: '🎮', name: 'video game' },
      { char: '🎰', name: 'slot machine' },
      { char: '🧩', name: 'puzzle piece' },
    ],
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    icon: <Car className="w-4 h-4" />,
    emojis: [
      { char: '🚗', name: 'automobile' },
      { char: '🚕', name: 'taxi' },
      { char: '🚙', name: 'sport utility vehicle' },
      { char: '🚌', name: 'bus' },
      { char: '🚎', name: 'trolleybus' },
      { char: '🏎️', name: 'racing car' },
      { char: '🚓', name: 'police car' },
      { char: '🚑', name: 'ambulance' },
      { char: '🚒', name: 'fire engine' },
      { char: '🚐', name: 'minibus' },
      { char: '🚚', name: 'delivery truck' },
      { char: '🚛', name: 'articulated lorry' },
      { char: '🚜', name: 'tractor' },
      { char: '🛴', name: 'kick scooter' },
      { char: '🚲', name: 'bicycle' },
      { char: '🛵', name: 'motor scooter' },
      { char: '🏍️', name: 'motorcycle' },
      { char: '🛺', name: 'auto rickshaw' },
      { char: '🚨', name: 'police car light' },
      { char: '🚄', name: 'high-speed train' },
      { char: '🚅', name: 'bullet train' },
      { char: '🚆', name: 'train' },
      { char: '🚇', name: 'metro' },
      { char: '🚉', name: 'station' },
      { char: '✈️', name: 'airplane' },
      { char: '🛫', name: 'airplane departure' },
      { char: '🛬', name: 'airplane arrival' },
      { char: '🚀', name: 'rocket' },
      { char: '🛸', name: 'flying saucer' },
      { char: '🚁', name: 'helicopter' },
      { char: '🛶', name: 'canoe' },
      { char: '⛵️', name: 'sailboat' },
      { char: '🚤', name: 'speedboat' },
      { char: '🛳️', name: 'passenger ship' },
      { char: '⛴️', name: 'ferry' },
      { char: '🚢', name: 'ship' },
      { char: '⚓️', name: 'anchor' },
      { char: '⛽️', name: 'fuel pump' },
      { char: '🚦', name: 'vertical traffic light' },
      { char: '🗺️', name: 'world map' },
      { char: '🗿', name: 'moai' },
      { char: '🗽', name: 'Statue of Liberty' },
      { char: '🗼', name: 'Tokyo tower' },
      { char: '🏰', name: 'castle' },
      { char: '🏯', name: 'Japanese castle' },
      { char: '🏟️', name: 'stadium' },
      { char: '🎡', name: 'ferris wheel' },
      { char: '🎢', name: 'roller coaster' },
      { char: '🏖️', name: 'beach with umbrella' },
      { char: '🏝️', name: 'desert island' },
      { char: '🌋', name: 'volcano' },
      { char: '⛰️', name: 'mountain' },
      { char: '🏔️', name: 'snow-capped mountain' },
      { char: '🏕️', name: 'camping' },
      { char: '⛺️', name: 'tent' },
      { char: '🏠', name: 'house' },
      { char: '🏡', name: 'house with garden' },
      { char: '🏢', name: 'office building' },
      { char: '🏣', name: 'Japanese post office' },
      { char: '🏥', name: 'hospital' },
      { char: '🏦', name: 'bank' },
      { char: '🏨', name: 'hotel' },
      { char: '🏫', name: 'school' },
      { char: '🏛️', name: 'classical building' },
      { char: '⛪️', name: 'church' },
      { char: '🕌', name: 'mosque' },
      { char: '🛕', name: 'hindu temple' },
    ],
  },
  {
    id: 'objects',
    name: 'Objects',
    icon: <Lightbulb className="w-4 h-4" />,
    emojis: [
      { char: '📱', name: 'mobile phone' },
      { char: '📲', name: 'mobile phone with arrow' },
      { char: '☎️', name: 'telephone' },
      { char: '📞', name: 'telephone receiver' },
      { char: '🔋', name: 'battery' },
      { char: '🔌', name: 'electric plug' },
      { char: '💻', name: 'laptop' },
      { char: '🖥️', name: 'desktop computer' },
      { char: '🖨️', name: 'printer' },
      { char: '⌨️', name: 'keyboard' },
      { char: '🖱️', name: 'computer mouse' },
      { char: '📷', name: 'camera' },
      { char: '📸', name: 'camera with flash' },
      { char: '📹', name: 'video camera' },
      { char: '🔍', name: 'magnifying glass tilted left' },
      { char: '🔎', name: 'magnifying glass tilted right' },
      { char: '🕯️', name: 'candle' },
      { char: '💡', name: 'light bulb' },
      { char: '🔦', name: 'flashlight' },
      { char: '📔', name: 'notebook with decorative cover' },
      { char: '📕', name: 'closed book' },
      { char: '📖', name: 'open book' },
      { char: '📗', name: 'green book' },
      { char: '📘', name: 'blue book' },
      { char: '📙', name: 'orange book' },
      { char: '📚', name: 'books' },
      { char: '📝', name: 'memo' },
      { char: '💼', name: 'briefcase' },
      { char: '📁', name: 'file folder' },
      { char: '📂', name: 'open file folder' },
      { char: '📅', name: 'calendar' },
      { char: '📆', name: 'tear-off calendar' },
      { char: '📋', name: 'clipboard' },
      { char: '📌', name: 'pushpin' },
      { char: '📍', name: 'round pushpin' },
      { char: '📎', name: 'paperclip' },
      { char: '🖇️', name: 'linked paperclips' },
      { char: '📏', name: 'straight ruler' },
      { char: '📐', name: 'triangular ruler' },
      { char: '✂️', name: 'scissors' },
      { char: '🔒', name: 'locked' },
      { char: '🔓', name: 'unlocked' },
      { char: '🔑', name: 'key' },
      { char: '🗝️', name: 'old key' },
      { char: '🔨', name: 'hammer' },
      { char: '🛠️', name: 'hammer and wrench' },
      { char: '🛡️', name: 'shield' },
      { char: '🔧', name: 'wrench' },
      { char: '⚙️', name: 'gear' },
      { char: '🔗', name: 'link' },
      { char: '🧰', name: 'toolbox' },
      { char: '🧲', name: 'magnet' },
      { char: '🧪', name: 'test tube' },
      { char: '🧬', name: 'dna' },
      { char: '🔬', name: 'microscope' },
      { char: '🔭', name: 'telescope' },
      { char: '📡', name: 'satellite antenna' },
      { char: '💉', name: 'syringe' },
      { char: '💊', name: 'pill' },
      { char: '🩹', name: 'adhesive bandage' },
      { char: '🩺', name: 'stethoscope' },
      { char: '🚪', name: 'door' },
      { char: '🛏️', name: 'bed' },
      { char: '🛋️', name: 'couch and lamp' },
      { char: '🚽', name: 'toilet' },
      { char: '🚿', name: 'shower' },
      { char: '🛁', name: 'bathtub' },
      { char: '🧹', name: 'broom' },
      { char: '🧺', name: 'basket' },
      { char: '🧻', name: 'roll of paper' },
      { char: '🧼', name: 'soap' },
      { char: '🛒', name: 'shopping cart' },
      { char: '🎁', name: 'wrapped gift' },
      { char: '🎈', name: 'balloon' },
      { char: '🎉', name: 'party popper' },
      { char: '🎊', name: 'confetti ball' },
      { char: '💰', name: 'money bag' },
      { char: '🪙', name: 'coin' },
      { char: '💵', name: 'dollar banknote' },
      { char: '💳', name: 'credit card' },
      { char: '💎', name: 'gem stone' },
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols',
    icon: <Hash className="w-4 h-4" />,
    emojis: [
      { char: '💯', name: 'hundred points' },
      { char: '⚠️', name: 'warning' },
      { char: '⛔️', name: 'no entry' },
      { char: '🚫', name: 'prohibited' },
      { char: '🔔', name: 'bell' },
      { char: '🔕', name: 'bell with slash' },
      { char: '🎵', name: 'musical note' },
      { char: '🎶', name: 'musical notes' },
      { char: '💬', name: 'speech balloon' },
      { char: '💭', name: 'thought balloon' },
      { char: '🗯️', name: 'right anger bubble' },
      { char: '♨️', name: 'hot springs' },
      { char: '🛑', name: 'stop sign' },
      { char: '⭕️', name: 'heavy large circle' },
      { char: '✅', name: 'check mark button' },
      { char: '☑️', name: 'check box with check' },
      { char: '✔️', name: 'check mark' },
      { char: '❌', name: 'cross mark' },
      { char: '❎', name: 'cross mark button' },
      { char: '➕', name: 'plus sign' },
      { char: '➖', name: 'minus sign' },
      { char: '➗', name: 'division sign' },
      { char: '✖️', name: 'multiply sign' },
      { char: '♾️', name: 'infinity' },
      { char: '‼️', name: 'double exclamation mark' },
      { char: '⁉️', name: 'exclamation question mark' },
      { char: '❓', name: 'question mark' },
      { char: '❔', name: 'white question mark' },
      { char: '❕', name: 'white exclamation mark' },
      { char: '❗️', name: 'exclamation mark' },
      { char: '💲', name: 'heavy dollar sign' },
      { char: '♻️', name: 'recycling symbol' },
      { char: '🔱', name: 'trident emblem' },
      { char: '🔰', name: 'Japanese symbol for beginner' },
      { char: '🟢', name: 'green circle' },
      { char: '🟡', name: 'yellow circle' },
      { char: '🟠', name: 'orange circle' },
      { char: '🔴', name: 'red circle' },
      { char: '🔵', name: 'blue circle' },
      { char: '🟣', name: 'purple circle' },
      { char: '🟤', name: 'brown circle' },
      { char: '⚫️', name: 'black circle' },
      { char: '⚪️', name: 'white circle' },
      { char: '🟩', name: 'green square' },
      { char: '🟨', name: 'yellow square' },
      { char: '🟧', name: 'orange square' },
      { char: '🟥', name: 'red square' },
      { char: '🟦', name: 'blue square' },
      { char: '🟪', name: 'purple square' },
      { char: '🟫', name: 'brown square' },
      { char: '⬛️', name: 'black large square' },
      { char: '⬜️', name: 'white large square' },
      { char: '🔘', name: 'radio button' },
      { char: '▶️', name: 'play button' },
      { char: '⏸️', name: 'pause button' },
      { char: '⏹️', name: 'stop button' },
      { char: '🔄', name: 'counterclockwise arrows button' },
      { char: '🔝', name: 'TOP arrow' },
      { char: '🔜', name: 'SOON arrow' },
      { char: '🔛', name: 'ON! arrow' },
      { char: '🔚', name: 'END arrow' },
      { char: '🔙', name: 'BACK arrow' },
      { char: '🆗', name: 'OK button' },
      { char: '🆙', name: 'UP! button' },
      { char: '🆒', name: 'COOL button' },
      { char: '🆕', name: 'NEW button' },
      { char: '🆓', name: 'FREE button' },
      { char: '0️⃣', name: 'keycap 0' },
      { char: '1️⃣', name: 'keycap 1' },
      { char: '2️⃣', name: 'keycap 2' },
      { char: '3️⃣', name: 'keycap 3' },
      { char: '4️⃣', name: 'keycap 4' },
      { char: '5️⃣', name: 'keycap 5' },
      { char: '6️⃣', name: 'keycap 6' },
      { char: '7️⃣', name: 'keycap 7' },
      { char: '8️⃣', name: 'keycap 8' },
      { char: '9️⃣', name: 'keycap 9' },
      { char: '🔟', name: 'keycap 10' },
    ],
  },
  {
    id: 'flags',
    name: 'Flags',
    icon: <Flag className="w-4 h-4" />,
    emojis: [
      { char: '🇮🇳', name: 'flag India' },
      { char: '🇺🇸', name: 'flag United States' },
      { char: '🇬🇧', name: 'flag United Kingdom' },
      { char: '🇨🇦', name: 'flag Canada' },
      { char: '🇦🇺', name: 'flag Australia' },
      { char: '🇩🇪', name: 'flag Germany' },
      { char: '🇫🇷', name: 'flag France' },
      { char: '🇯🇵', name: 'flag Japan' },
      { char: '🇨🇳', name: 'flag China' },
      { char: '🇧🇷', name: 'flag Brazil' },
      { char: '🇷🇺', name: 'flag Russia' },
      { char: '🇮🇹', name: 'flag Italy' },
      { char: '🇪🇸', name: 'flag Spain' },
      { char: '🇲🇽', name: 'flag Mexico' },
      { char: '🇰🇷', name: 'flag South Korea' },
      { char: '🇸🇦', name: 'flag Saudi Arabia' },
      { char: '🇿🇦', name: 'flag South Africa' },
      { char: '🇦🇪', name: 'flag United Arab Emirates' },
      { char: '🇸🇬', name: 'flag Singapore' },
      { char: '🇲🇾', name: 'flag Malaysia' },
      { char: '🏁', name: 'chequered flag' },
      { char: '🚩', name: 'triangular flag' },
      { char: '🎌', name: 'crossed flags' },
      { char: '🏴', name: 'black flag' },
      { char: '🏳️', name: 'white flag' },
      { char: '🏳️‍🌈', name: 'rainbow flag' },
      { char: '🏴‍☠️', name: 'pirate flag' },
    ],
  },
];

const LOCAL_RECENT_EMOJIS_KEY = 'whatsapp_recent_emojis';

interface WhatsAppEmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onBackspace: () => void;
  onClose?: () => void;
}

export const WhatsAppEmojiPicker: React.FC<WhatsAppEmojiPickerProps> = ({
  onSelectEmoji,
  onBackspace,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredEmoji, setHoveredEmoji] = useState<{ char: string; name: string } | null>(null);

  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_RECENT_EMOJIS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['❤️', '😂', '😍', '👍', '🔥', '✨', '🥰', '🙏', '😊', '🎉', '🥺', '😭'];
  });

  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleEmojiClick = (emojiChar: string, name?: string) => {
    onSelectEmoji(emojiChar);

    // Update recent emojis
    setRecentEmojis((prev) => {
      const next = [emojiChar, ...prev.filter((e) => e !== emojiChar)].slice(0, 32);
      try {
        localStorage.setItem(LOCAL_RECENT_EMOJIS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    const results: { char: string; name: string }[] = [];
    const seen = new Set<string>();

    for (const cat of EMOJI_CATEGORIES) {
      for (const em of cat.emojis) {
        if ((em.name.includes(q) || em.char === q) && !seen.has(em.char)) {
          seen.add(em.char);
          results.push(em);
        }
      }
    }
    return results;
  }, [searchQuery]);

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    setSearchQuery('');
    const target = categoryRefs.current[catId];
    if (target && scrollContainerRef.current) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full bg-[#1e2a30] border-t border-[#2a3942] flex flex-col h-72 sm:h-80 shadow-2xl select-none animate-in slide-in-from-bottom-6 duration-200 z-40">
      {/* Top Search & Action Bar */}
      <div className="p-2 sm:px-3 sm:py-2 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex-1 bg-[#111b21] rounded-xl px-3 py-1.5 flex items-center gap-2 border border-transparent focus-within:border-[#00a884]/60">
          <Search className="w-4 h-4 text-[#8696a0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emoji (smile, heart, car, flag...)"
            className="w-full bg-transparent text-xs text-[#e9edef] placeholder-[#8696a0] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#8696a0] hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Backspace Button */}
        <button
          onClick={onBackspace}
          className="p-2 rounded-xl bg-[#2a3942] hover:bg-[#32444f] text-[#d1d7db] hover:text-rose-400 transition-colors flex items-center justify-center flex-shrink-0 shadow-sm"
          title="Backspace / Delete last character"
        >
          <Delete className="w-4 h-4" />
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8696a0] hover:text-white hover:bg-white/5 transition-colors"
            title="Close emoji picker"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Categories Navigation Bar */}
      {!searchQuery && (
        <div className="flex items-center justify-around bg-[#182229] border-b border-[#2a3942] px-1 py-1 flex-shrink-0 overflow-x-auto no-scrollbar">
          {/* Recent */}
          <button
            onClick={() => scrollToCategory('recent')}
            className={`p-2 rounded-lg transition-colors flex items-center justify-center relative ${
              activeCategory === 'recent'
                ? 'text-[#00a884] bg-white/5'
                : 'text-[#8696a0] hover:text-[#d1d7db]'
            }`}
            title="Recent"
          >
            <Clock className="w-4 h-4" />
            {activeCategory === 'recent' && (
              <span className="absolute bottom-0 inset-x-2 h-0.5 bg-[#00a884] rounded-full" />
            )}
          </button>

          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center relative ${
                activeCategory === cat.id
                  ? 'text-[#00a884] bg-white/5'
                  : 'text-[#8696a0] hover:text-[#d1d7db]'
              }`}
              title={cat.name}
            >
              {cat.icon}
              {activeCategory === cat.id && (
                <span className="absolute bottom-0 inset-x-2 h-0.5 bg-[#00a884] rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Emojis Scroll Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 space-y-4 text-left scroll-smooth"
      >
        {/* Search Results */}
        {filteredEmojis !== null ? (
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#8696a0] mb-2">
              Search Results ({filteredEmojis.length})
            </div>
            {filteredEmojis.length === 0 ? (
              <div className="py-8 text-center text-[#8696a0] text-xs">
                No matching emoji found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-11 gap-1">
                {filteredEmojis.map((em) => (
                  <button
                    key={em.char}
                    type="button"
                    onClick={() => handleEmojiClick(em.char, em.name)}
                    onMouseEnter={() => setHoveredEmoji(em)}
                    className="w-10 h-10 rounded-xl hover:bg-[#2a3942] flex items-center justify-center transition-transform hover:scale-125 active:scale-95"
                    title={em.name}
                  >
                    <EmojiSvg emoji={em.char} className="w-6 h-6 object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Recent / Frequently Used */}
            {recentEmojis.length > 0 && (
              <div
                ref={(el) => {
                  categoryRefs.current['recent'] = el;
                }}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8696a0] mb-2 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#00a884]" />
                  <span>Recent &amp; Favorites</span>
                </div>
                <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-11 gap-1">
                  {recentEmojis.map((char) => (
                    <button
                      key={'recent-' + char}
                      type="button"
                      onClick={() => handleEmojiClick(char)}
                      onMouseEnter={() => setHoveredEmoji({ char, name: 'recent' })}
                      className="w-10 h-10 rounded-xl hover:bg-[#2a3942] flex items-center justify-center transition-transform hover:scale-125 active:scale-95"
                    >
                      <EmojiSvg emoji={char} className="w-6 h-6 object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categorized Emojis */}
            {EMOJI_CATEGORIES.map((category) => (
              <div
                key={category.id}
                ref={(el) => {
                  categoryRefs.current[category.id] = el;
                }}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#8696a0] mb-2 flex items-center gap-1.5 sticky top-0 bg-[#1e2a30] py-1 z-10">
                  <span className="text-emerald-400">{category.icon}</span>
                  <span>{category.name}</span>
                </div>
                <div className="grid grid-cols-7 sm:grid-cols-9 md:grid-cols-11 gap-1">
                  {category.emojis.map((em) => (
                    <button
                      key={em.char}
                      type="button"
                      onClick={() => handleEmojiClick(em.char, em.name)}
                      onMouseEnter={() => setHoveredEmoji(em)}
                      className="w-10 h-10 rounded-xl hover:bg-[#2a3942] flex items-center justify-center transition-transform hover:scale-125 active:scale-95"
                      title={em.name}
                    >
                      <EmojiSvg emoji={em.char} className="w-6 h-6 object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Bottom Status / Preview Bar */}
      <div className="px-3 py-1.5 bg-[#182229] border-t border-[#2a3942] flex items-center justify-between text-[11px] text-[#8696a0] flex-shrink-0">
        {hoveredEmoji ? (
          <div className="flex items-center gap-2 truncate">
            <EmojiSvg emoji={hoveredEmoji.char} className="w-4 h-4 object-contain" />
            <span className="capitalize text-white font-medium truncate">{hoveredEmoji.name}</span>
          </div>
        ) : (
          <span>WhatsApp High Definition Vector Emoji Engine</span>
        )}
        <span className="text-[10px] text-[#00a884] font-semibold">Twemoji SVG</span>
      </div>
    </div>
  );
};
