/* Menu content for The Reach Riverside.
   Edit prices and dishes here. Item format: [name, price, description, dietary tags]
   Wine item format: [name, description, glass price, bottle price]
   A string item beginning with "#" renders as a sub-heading. */
window.MENU = [
  {id:"bread-nibbles", group:"Food", title:"Bread & Nibbles", items:[
    ["Toasted Sourdough","4"],["Artisan Flatbread","4"],["Bread Basket","7"],
    ["Marinated Olives","5","","V GF"],["Mixed Nuts","4","","VG GF"],["Truffle Parmesan Fries","8"]]},
  {id:"small-plates", group:"Food", title:"Small Plates", items:[
    ["Classic Hummus","8","","V GF"],["Smoked Aubergine","9","","V GF"],["Tzatziki","8","","V GF"],
    ["The Reach Trio","18","Classic hummus, smoked aubergine & tzatziki","V GF"],
    ["Padrón Peppers","8","Maldon salt","VG GF"],["Gambas al Ajillo","12","","GF"],
    ["Patatas Bravas","9","Aioli","V"],["Chilli Cauliflower","10","Tzatziki, mint sauce","V GF"],
    ["Crispy Calamari","12","Citrus zest, garlic chilli"],["Truffle Arancini","9","Parmesan, pomodoro sauce","V"],
    ["Mushroom Croquettes","9","Aioli","V"],["Soujouk Sausages","12","Tomato, peppers, coriander"],
    ["Chorizo","10","Garlic butter, confit garlic","GF"],["Grilled Halloumi","9","Mint pesto, labneh","V GF"]]},
  {id:"salads", group:"Food", title:"Salads", items:[
    ["Burrata, Tomato & Basil Oil","15","","V GF"],["Classic Prawn Cocktail","15","Marie Rose sauce, gem lettuce & cucumber"],
    ["Greek Salad","15","Feta, capers & fresh mint","V GF"],
    ["Goat's Cheese Salad","15","Tomato, rocket, roasted pine nuts, walnuts & honey","V"]]},
  {id:"riverside-classics", group:"Food", title:"Riverside Classics", items:[
    ["The Reach Cheeseburger","22","Angus beef patty, mature cheddar, lettuce, tomato, burger sauce & fries. Add bacon £3"],
    ["Fish & Chips","24","Beer-battered haddock, peas, tartare sauce & charred lemon"],
    ["Chicken Schnitzel","24","Lemon, parsley butter, rocket salad & fries"],
    ["Pan-fried Sea Bass","23","Peppers, potato, creamy beurre blanc","GF"],
    ["Pasta with Chilli Garlic Prawns","24","Chilli, garlic, parsley, olive oil"],
    ["Salmon Fillet","25","Sautéed garlic green beans, Café de Paris sauce"],
    ["Grilled Octopus","22.50","Chorizo, parmentier potato, garlic sauce","GF"],
    ["Moorish Couscous","22","Roasted vegetables, chickpeas, dried fruits, almonds, harissa, herbs","V"]]},
  {id:"from-the-grill", group:"Food", title:"From the Grill", items:[
    ["Rib Eye Steak, 10oz | 280g","35","Café de Paris, fries","GF"],["Lamb Chops","33","House salad, mint pesto"],
    ["Chicken Skewers","25","Lebanese-style, saffron rice, garlic sauce","GF"],
    ["Moorish Couscous","34","Braised lamb shank. Vegetarian option available without lamb, £22","V"]]},
  {id:"sides", group:"Food", title:"Sides", items:[
    ["Fries","6","","VG"],["Truffle Fries","8","","V"],["Sweet Potato Fries","7","","VG"],["Saffron Rice","6","","GF"],
    ["Buttered Couscous","7","","V"],["Sautéed Garlic Green Beans","8","","VG GF"],["House Salad","8","","VG GF"],["Cauliflower Cheese","5","","V"]]},
  {id:"brunch", group:"Food", title:"Brunch", items:[
    ["Chorizo Hash","16","Chorizo, poached eggs, patatas bravas, hollandaise, toasted sourdough"],
    ["Eggs Benedict","15","Poached eggs, ham, hollandaise, toasted sourdough"],
    ["Eggs Royale","16","Poached eggs, smoked salmon, hollandaise, toasted sourdough"],
    ["Avocado on Toast","15","Smashed avocado, poached eggs, roasted pine nuts, chilli flakes, toasted sourdough","V VG"],
    ["French Toast","14","Salted caramel, berry compote, fresh fruits","V"],
    ["Mediterranean Brunch","18","Fried eggs, grilled halloumi, smashed avocado, sautéed garlic mushrooms, feta, patatas, toasted sourdough","V"]]},
  {id:"sunday-roast", group:"Food", title:"Sunday Roast", note:"Available every Sunday from 12 midday until 4pm", items:[
    ["Roast Beef","24"],["Roast Lamb","26"],["Roast Chicken","22"],["Vegetarian Roast, Cauliflower Steak","20","","V"],
    "#All served with Yorkshire pudding, roast potatoes, seasonal vegetables and house gravy",
    ["Add Cauliflower Cheese","5","","V"]]},
  {id:"desserts", group:"Food", title:"Desserts", items:[
    ["Tiramisu Torte","9","","V"],["Mango Charlotte","9","","V"],["Honeycomb Cheesecake","9","","V"],["Madagascan Vanilla Cheesecake","9"],
    ["Tarte Tatin","9.50","Vanilla ice cream, caramel sauce"],["Chocolate Fondant","9.50","Vanilla ice cream, chocolate sauce"],
    ["Sticky Toffee Pudding","9.50","Vanilla ice cream, caramel sauce"]]},

  {id:"signature-cocktails", group:"Drinks", title:"Signature Cocktails", items:[
    ["Sunday Morning Linen","14","Vodka, St. Germain & dry vermouth"],["Second Date","14","Vanilla vodka, chambord, raspberries & mint"],
    ["Cloud Kyu","14","Vodka, yuzu, lemon juice, soda water, pinch of sea salt"],["The Smashed One","14","Gin, fresh basil, lemon juice & sugar syrup"],
    ["Stained Silk","14","Aperol, mint, lillet blanc & lemon"],["The Greenhouse","14","Gin, vodka, lillet & cucumber"],
    ["Jaded Kiss","14","Bourbon, sweet vermouth, Kahlua & bitters"]]},
  {id:"classic-cocktails", group:"Drinks", title:"Classic Cocktails", items:[
    ["Aperol Spritz","12","Aperol, prosecco d.o.c. extra dry & club soda"],["Negroni","12","Gin, campari & vermouth rosso"],
    ["Bellini","12","Very Italian. Prosecco & peach purée"],["Pornstar Martini","12","Vanilla vodka, passionfruit liqueur, passionfruit purée & lime"],
    ["Classic Mojito","12","White rum, mint, lime juice, sugar syrup and club soda"],["Espresso Martini","12","Vodka, espresso and coffee liqueur"],
    ["Strawberry Daquiri","12","CM's original spiced gold, strawberries, lime & sugar syrup"],["Piña Colada","12","Classic from Puerto Rico. Rum, coconut, pineapple & lime juice"],
    ["Zack's On The Beach","12","Refreshing. Vodka, creme de cassis, orange juice and cranberry juice"],["Moscow Mule","12","Vodka, lime juice and ginger beer"],
    ["Margarita","12","Tequila, lime juice, orange liqueur and agave syrup"],["Bloody Mary","12","Vodka, tomato juice, lemon juice & other spices"]]},
  {id:"mocktails", group:"Drinks", title:"Mocktails", items:[
    ["No-ABV Margarita","9","Lime juice, agave nectar, orange juice with a salted rim"],
    ["Lavender Lemonade Fizz","9","Lemonade mixed with lavender syrup and sparkling water"],
    ["Virgin Cosmopolitan","9","Cranberry juice, lime juice, and orange juice, shaken with ice"]]},
  {id:"beers", group:"Drinks", title:"Beers", items:[
    ["MCB Monte Carlo Beer","3.75 | 7","Balanced, crisp, clean with floral and citrusy notes from French hops, a pleasant lingering bitterness. ABV 4.8%"],
    ["Madri","3.75 | 7","Crisp, clean, light with balanced bitterness and subtle floral and fruity notes. ABV 4.6%"],
    ["Guinness","3.75 | 7","A perfect balance of bitter and sweet, with malt and roast undertones. ABV 4.2%"],
    ["Aspall","3.75 | 7","Generally crisp, medium-dry, and refreshing with a balance of fruity notes and subtle tannins. ABV 5.5%"],
    ["The Reach","3.75 | 7","Subtle hints of red apple and banana with an underlying grainy malt. ABV 4.2%"],
    ["Lucky Saint","5","Refreshing, balanced profile with biscuity malts, subtle citrus notes and a clean, crisp finish. ABV 0%"]]},

  {id:"sparkling", group:"Wine", title:"Sparkling", wine:true, head:["125ml","Bottle"], items:[
    ["Prosecco Extra Dry","Fili, Sacchetto, Italy","9.75","39"],["Prosecco Millesimato Rosé Brut","Sacchetto, Italy","","40"],
    ["Champagne Porte Noire","Petit Porte Extra Brut, France","","75"],["Bollinger","Special Cuvée, Champagne, France","","110"],
    ["Veuve Clicquot Brut","Yellow Label, France","","130"],["Moët et Chandon","Brut Imperial, France","","140"],["Dom Pérignon","Champagne, France","","285"]]},
  {id:"white-wines", group:"Wine", title:"White Wines", wine:true, head:["175ml","Bottle"], items:[
    ["Colheita Branco","Sobreiro de Pegões, Portugal","7.50","30"],["Pinot Grigio","Elfo, Sacchetto, Italy","8","31"],
    ["Viognier","Viña Edmara, Chile","","31"],["Sauvignon/Colombard","Terra Vallona, France","8.25","32"],
    ["Macabeo/Sauvignon Blanc","La Purísima, Spain","","34"],["Avesso Vinho Verde","Leme, Portugal","","37"],
    ["Côtes du Rhône Blanc","Paul Jaboulet Aîné, France","","39"],["Chardonnay","Les Colombiers, Villa Noria, France","","41"],
    ["Albariño","Rías Baixas, Pazo do Mar, Spain","11","44"],["Sauvignon Blanc","Origin, Saint Clair, New Zealand","","51"],
    ["Gavi del Commune di Gavi","La Scolca, Italy","","56"],["Chablis","Domaine Grand Roche, France","","69"],["Sancerre","Eric Louis, France","","72"]]},
  {id:"rose-wines", group:"Wine", title:"Rosé Wines", wine:true, head:["175ml","Bottle"], items:[
    ["Pinot Grigio Blush","Sacchetto, Italy","8","32"],["Provence Rosé","Château de l'Aumérade, France","","42"],
    ["Côtes de Provence Rosé","Ultimate Provence, France","","55"]]},
  {id:"red-wines", group:"Wine", title:"Red Wines", wine:true, head:["175ml","Bottle"], items:[
    ["Colheita Tinto","Sobreiro de Pegões, Portugal","7.50","30"],["Merlot/Cabernet","Terra Vallona, France","8.25","32"],
    ["Primitivo","Il Pumo, San Marzano, Italy","","33"],["Cabernet Sauvignon Reserva","Viña Echeverría, Chile","","34"],
    ["Merlot","Domaine des Pourthié, France","8.75","35"],["Rioja","Primeur, Bodegas Ondarre, Spain","9.50","38"],
    ["Shiraz","Leeuwenkuil Family Vineyards, South Africa","","39"],["Malbec","Signos, Bodegas Salentein, Argentina","10.50","40"],
    ["Chianti Classico","Bonacchi, Italy","","43"],["Côtes du Rhône Rouge","Paul Jaboulet Aîné, France","","44"],
    ["Rioja Reserva","Bodegas Ondarre, Spain","","45"],["Pinot Noir","Origin, Saint Clair, New Zealand","","46"],
    ["Mendo Blendo","Tollini Vineyard, Peterson Winery, USA","","52"],["Châteauneuf-du-Pape","Les Vallons de la Solitude, France","","68"],
    ["Saint-Émilion Grand Cru","Château Cruzeau, France","","71"],["Barolo Riserva","Costa di Bussia, Italy","","72"],
    ["Amarone della Valpolicella","La Collina dei Ciliegi, Italy","","81"]]},
  {id:"dessert-wine", group:"Wine", title:"Dessert Wine", wine:true, head:["125ml","Bottle"], items:[
    ["Sauternes","Château Suduiraut, France","12","36"]]},
  {id:"zero-alc-wines", group:"Wine", title:"0% Alc Wines", wine:true, head:["Glass","Bottle"], items:[
    ["Levin 0% Chardonnay","Villa Noria, France","6.50","24"],["Levin 0% Pinot Noir","Villa Noria, France","6.50","24"],
    ["Levin 0% Rosé","Villa Noria, France","6.50","24"]]}
];
