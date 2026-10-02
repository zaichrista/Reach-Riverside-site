/* Christmas menu for The Reach Riverside, rendered by menus.js exactly like the main menus.
   Item format: [name, price, description, dietary tags] */
window.MENU = [
  {id:"starters", group:"Festive menu", title:"Starters", items:[
    ["Prawn Cocktail","","Lettuce, cucumber, avocado & spiced Marie Rose sauce"],
    ["Smoked Salmon","","Horseradish crème fraîche, capers, dill & lemon"],
    ["Burrata Salad","","Heritage tomatoes, basil pesto & balsamic","V"],
    ["Wild Mushroom Arancini","","Truffle mayonnaise & Parmesan","V"]]},
  {id:"mains", group:"Festive menu", title:"Mains", items:[
    ["Traditional Roast Turkey","","Sage & onion stuffing, crisp roast potatoes, seasonal vegetables, cranberry sauce & rich turkey gravy"],
    ["Chargrilled Octopus","","Baby potatoes, tomato, cucumber, olives, rocket & lemon-herb dressing"],
    ["Grilled Chicken Skewer","","Homemade garlic aioli, seasoned potatoes & dressed leaves"],
    ["Moorish Vegetable Couscous","","Roasted vegetables, chickpeas, herbs & pomegranate","VG"],
    ["Pan-Roasted Salmon","","Crushed potatoes, tenderstem broccoli & lemon herb butter"]]},
  {id:"desserts", group:"Festive menu", title:"Desserts", items:[
    ["Traditional Christmas Pudding","","Rich festive fruits & warming spices, served with brandy sauce"],
    ["Apple Tarte Tatin","","Caramelised apples in buttery pastry, served with vanilla ice cream"],
    ["Madagascan Vanilla Cheesecake","","Served with biscuit crumb"],
    ["Festive Chocolate & Salted Caramel Pinecone","","Milk & dark chocolate mousse, salted caramel heart, chocolate fudge cake & cocoa velvet"],
    ["Fresh Fruit Platter","","Seasonal fruits, berry compote","VG GF"]]},
  {id:"festive-sides", group:"Festive menu", title:"Additional Festive Sides", items:[
    ["Pigs in Blankets",""],
    ["Creamy Mashed Potato",""],
    ["Garden Peas & Broad Beans","","with baby shoots"],
    ["Buttered Garlic Green Beans","","with roasted almonds"]]}
];

/* the closing enquiry window holds centred in the space below the (scrolled) menu bar; one too tall for that holds with its bottom edge showing */
(function(){
  var w=document.querySelector('.x-hold>.x-window'); if(!w) return;
  function fit(){ var nav=window.innerWidth<=640?66:88, h=w.offsetHeight, room=window.innerHeight-nav-h; w.style.top=(room>=32?nav+room/2:Math.min(nav+16,window.innerHeight-h-16))+'px'; }
  fit(); window.addEventListener('resize',fit); window.addEventListener('load',fit);
  if(window.ResizeObserver) new ResizeObserver(fit).observe(w);
})();
