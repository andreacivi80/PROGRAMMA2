export type VisualItem={en:string;it:string;verb:string};
export type VisualSet={id:string;title:string;image:string;items:VisualItem[]};

export const kitchenVisualSets:VisualSet[]=[
 {id:"basic",title:"Utensili essenziali",image:"images/kitchen-utensils-grid.png",items:[
  {en:"wooden spoon",it:"cucchiaio di legno",verb:"stir · mescolare"},{en:"ladle",it:"mestolo",verb:"serve · servire"},{en:"whisk",it:"frusta",verb:"whisk / beat · sbattere"},{en:"spatula",it:"spatola",verb:"flip · girare"},{en:"peeler",it:"pelapatate",verb:"peel · sbucciare"},{en:"grater",it:"grattugia",verb:"grate · grattugiare"},{en:"funnel",it:"imbuto",verb:"pour · versare"},{en:"rolling pin",it:"mattarello",verb:"roll out · stendere"},{en:"chopping board",it:"tagliere",verb:"chop · tritare"}
 ]},
 {id:"cookware",title:"Pentole, lame e contenitori",image:"images/kitchen-utensils-grid-2.png",items:[
  {en:"chef's knife",it:"coltello da chef",verb:"slice · affettare"},{en:"paring knife",it:"spelucchino",verb:"peel · sbucciare"},{en:"saucepan",it:"casseruola",verb:"simmer · cuocere lentamente"},{en:"frying pan",it:"padella",verb:"fry · friggere"},{en:"stock pot",it:"pentola alta",verb:"boil · bollire"},{en:"colander",it:"scolapasta",verb:"drain · scolare"},{en:"sieve",it:"setaccio",verb:"sift · setacciare"},{en:"mixing bowl",it:"ciotola da impasto",verb:"mix · mescolare"},{en:"measuring jug",it:"caraffa graduata",verb:"measure · misurare"}
 ]},
 {id:"baking",title:"Pasticceria e forno",image:"images/kitchen-utensils-grid-3.png",items:[
  {en:"baking tray",it:"teglia da forno",verb:"bake · cuocere al forno"},{en:"cake tin",it:"stampo per torta",verb:"line · foderare"},{en:"muffin tin",it:"stampo per muffin",verb:"fill · riempire"},{en:"pastry brush",it:"pennello da cucina",verb:"brush · spennellare"},{en:"piping bag",it:"sac à poche",verb:"pipe · decorare"},{en:"cookie cutter",it:"tagliabiscotti",verb:"cut out · ritagliare"},{en:"kitchen scales",it:"bilancia da cucina",verb:"weigh · pesare"},{en:"measuring spoons",it:"cucchiai dosatori",verb:"measure · dosare"},{en:"oven mitt",it:"guanto da forno",verb:"protect · proteggere"}
 ]},
 {id:"gadgets",title:"Piccoli strumenti",image:"images/kitchen-utensils-grid-4.png",items:[
  {en:"garlic press",it:"spremiaglio",verb:"crush · schiacciare"},{en:"can opener",it:"apriscatole",verb:"open · aprire"},{en:"bottle opener",it:"apribottiglie",verb:"open · stappare"},{en:"corkscrew",it:"cavatappi",verb:"uncork · stappare"},{en:"kitchen scissors",it:"forbici da cucina",verb:"snip · tagliare"},{en:"kitchen tongs",it:"pinze da cucina",verb:"grip · afferrare"},{en:"potato masher",it:"schiacciapatate",verb:"mash · schiacciare"},{en:"mortar and pestle",it:"mortaio e pestello",verb:"grind · pestare"},{en:"citrus juicer",it:"spremiagrumi",verb:"squeeze · spremere"}
 ]},
 {id:"serving",title:"Servire e conservare",image:"images/kitchen-utensils-grid-5.png",items:[
  {en:"slotted spoon",it:"cucchiaio forato",verb:"lift · sollevare"},{en:"skimmer",it:"schiumarola",verb:"skim · schiumare"},{en:"carving fork",it:"forchettone",verb:"hold · tenere fermo"},{en:"serving tray",it:"vassoio",verb:"serve · servire"},{en:"salad bowl",it:"insalatiera",verb:"toss · condire e mescolare"},{en:"pepper mill",it:"macinapepe",verb:"grind · macinare"},{en:"food container",it:"contenitore per alimenti",verb:"store · conservare"},{en:"ice cube tray",it:"vaschetta del ghiaccio",verb:"freeze · congelare"},{en:"thermos flask",it:"thermos",verb:"keep warm · tenere caldo"}
 ]},
 {id:"appliances",title:"Elettrodomestici e accessori",image:"images/kitchen-utensils-grid-6.png",items:[
  {en:"kitchen timer",it:"timer da cucina",verb:"time · cronometrare"},{en:"cooking thermometer",it:"termometro da cucina",verb:"check · controllare"},{en:"blender",it:"frullatore",verb:"blend · frullare"},{en:"hand mixer",it:"sbattitore elettrico",verb:"beat · sbattere"},{en:"food processor",it:"robot da cucina",verb:"process · lavorare"},{en:"electric kettle",it:"bollitore elettrico",verb:"boil · bollire"},{en:"toaster",it:"tostapane",verb:"toast · tostare"},{en:"microwave oven",it:"forno a microonde",verb:"reheat · riscaldare"},{en:"kitchen apron",it:"grembiule da cucina",verb:"wear · indossare"}
 ]}
];
export const jobVisualSets:VisualSet[]=[{id:"jobs",title:"Lavori e professioni",image:"images/visual-jobs-grid.png",items:[
 {en:"chef",it:"cuoco/a",verb:"cook · cucinare"},{en:"waiter",it:"cameriere",verb:"serve · servire"},{en:"nurse",it:"infermiere/a",verb:"care for · assistere"},{en:"doctor",it:"medico",verb:"treat · curare"},{en:"teacher",it:"insegnante",verb:"teach · insegnare"},{en:"mechanic",it:"meccanico",verb:"repair · riparare"},{en:"electrician",it:"elettricista",verb:"install · installare"},{en:"carpenter",it:"falegname",verb:"build · costruire"},{en:"firefighter",it:"vigile del fuoco",verb:"rescue · soccorrere"}
]}];

export const actionVisualSets:VisualSet[]=[{id:"actions",title:"Azioni quotidiane",image:"images/visual-actions-grid.png",items:[
 {en:"sit down",it:"sedersi",verb:"sit – sat – sat"},{en:"stand up",it:"alzarsi",verb:"stand – stood – stood"},{en:"open a door",it:"aprire una porta",verb:"open · aprire"},{en:"close a window",it:"chiudere una finestra",verb:"close · chiudere"},{en:"pick up a box",it:"sollevare una scatola",verb:"pick up · raccogliere"},{en:"put down a bag",it:"posare una borsa",verb:"put down · posare"},{en:"turn on a light",it:"accendere una luce",verb:"turn on · accendere"},{en:"turn off a tap",it:"chiudere un rubinetto",verb:"turn off · spegnere/chiudere"},{en:"wash your hands",it:"lavarsi le mani",verb:"wash · lavare"}
]}];