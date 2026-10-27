/* La Vigneraie : interactions du site */
(function(){
  // Écran d'entrée : une photo et le logo, glisse vers le haut après 2 s, à chaque chargement de l'accueil
  if('scrollRestoration' in history) history.scrollRestoration='manual';
  var loader=document.querySelector('.loader');
  if(loader&&location.hash){loader.remove();}
  else if(loader){
    document.documentElement.style.overflow='hidden';
    setTimeout(function(){
      loader.classList.add('fini');
      document.documentElement.style.overflow='';
      setTimeout(function(){loader.remove();},950);
    },2200);
  }

  // En-tête : transparent sur la photo, plein au défilement
  var entete=document.querySelector('.entete');
  var majEntete=function(){ if(entete) entete.classList.toggle('plein',window.scrollY>40); };
  majEntete(); window.addEventListener('scroll',majEntete,{passive:true});
  var burger=document.querySelector('.burger');
  if(burger){burger.addEventListener('click',function(){
    var o=entete.classList.toggle('menu-ouvert');
    burger.setAttribute('aria-expanded',o?'true':'false');
    document.documentElement.style.overflow=o?'hidden':'';
  });}

  // Hero : trois photos en fondu, une par une
  var diapos=[].slice.call(document.querySelectorAll('.hero .diapos img'));
  if(diapos.length>1){var d=0;setInterval(function(){diapos[d].classList.remove('actif');d=(d+1)%diapos.length;diapos[d].classList.add('actif');},6000);}

  // Rail des hébergements : flèches qui font défiler d'une carte
  document.querySelectorAll('.rail').forEach(function(r){
    var piste=r.querySelector('.rail-piste');
    var pas=function(){var c=piste.firstElementChild;return c?c.getBoundingClientRect().width+20:300;};
    r.querySelector('.prec').addEventListener('click',function(){piste.scrollBy({left:-pas(),behavior:'smooth'});});
    r.querySelector('.suiv').addEventListener('click',function(){
      var fin=piste.scrollLeft+piste.clientWidth>=piste.scrollWidth-4;
      piste.scrollTo({left:fin?0:piste.scrollLeft+pas(),behavior:'smooth'});
    });
  });

  // Apparition au défilement
  var els=document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('vu');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){io.observe(el);});
  } else els.forEach(function(el){el.classList.add('vu');});

  // Visionneuse : photo entière, jamais recadrée
  var boutons=[].slice.call(document.querySelectorAll('[data-galerie]'));
  if(boutons.length){
    var v=document.createElement('div');
    v.className='visionneuse';
    v.innerHTML='<button class="fermer" aria-label="Fermer">&times;</button><button class="prec" aria-label="Photo précédente">&#8249;</button><img alt=""><div class="legende"></div><button class="suiv" aria-label="Photo suivante">&#8250;</button>';
    document.body.appendChild(v);
    var img=v.querySelector('img'),leg=v.querySelector('.legende'),i=0;
    var montre=function(n){i=(n+boutons.length)%boutons.length;var b=boutons[i];img.src=b.getAttribute('data-galerie');img.alt=b.getAttribute('data-legende')||'';leg.textContent=(b.getAttribute('data-legende')||'')+'  ·  '+(i+1)+' / '+boutons.length;};
    boutons.forEach(function(b,n){b.addEventListener('click',function(){montre(n);v.classList.add('ouverte');});});
    v.querySelector('.fermer').onclick=function(){v.classList.remove('ouverte');};
    v.querySelector('.prec').onclick=function(e){e.stopPropagation();montre(i-1);};
    v.querySelector('.suiv').onclick=function(e){e.stopPropagation();montre(i+1);};
    v.addEventListener('click',function(e){if(e.target===v)v.classList.remove('ouverte');});
    document.addEventListener('keydown',function(e){if(!v.classList.contains('ouverte'))return;if(e.key==='Escape')v.classList.remove('ouverte');if(e.key==='ArrowLeft')montre(i-1);if(e.key==='ArrowRight')montre(i+1);});
  }

  // Fenêtres des chambres : une fenêtre par hébergement, ouverte sur la même page
  var modales={};
  var ouvre=function(m){
    m.classList.add('ouverte');
    document.documentElement.style.overflow='hidden';
    m.querySelector('.piste-photos').scrollLeft=0;
    m.dispatchEvent(new Event('maj'));
    m.querySelector('.modale-corps').scrollTop=0;
    m.querySelector('.modale-fermer').focus();
  };
  var ferme=function(m){
    m.classList.remove('ouverte');
    document.documentElement.style.overflow='';
  };
  document.querySelectorAll('.modale').forEach(function(m){
    modales[m.id.replace('modale-','')]=m;
    var piste=m.querySelector('.piste-photos'),imgs=piste.children,points=m.querySelectorAll('.points button'),compte=m.querySelector('.compte');
    var courant=function(){return piste.clientWidth?Math.round(piste.scrollLeft/piste.clientWidth):0;};
    var maj=function(){var n=courant();points.forEach(function(p,i){p.classList.toggle('actif',i===n);});compte.textContent=(n+1)+' / '+imgs.length;};
    var va=function(n){n=(n+imgs.length)%imgs.length;piste.scrollTo({left:n*piste.clientWidth,behavior:'smooth'});};
    piste.addEventListener('scroll',maj,{passive:true});
    m.querySelector('.prec').addEventListener('click',function(){va(courant()-1);});
    m.querySelector('.suiv').addEventListener('click',function(){va(courant()+1);});
    points.forEach(function(p,i){p.addEventListener('click',function(){va(i);});});
    m.addEventListener('click',function(e){if(e.target===m)ferme(m);});
    m.querySelector('.modale-fermer').addEventListener('click',function(){ferme(m);});
    m.addEventListener('maj',maj);
    maj();
  });
  document.addEventListener('click',function(e){
    var d=e.target.closest('[data-ouvre]');
    if(!d||!modales[d.getAttribute('data-ouvre')])return;
    e.preventDefault();
    ouvre(modales[d.getAttribute('data-ouvre')]);
  });
  document.addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    Object.keys(modales).forEach(function(k){if(modales[k].classList.contains('ouverte'))ferme(modales[k]);});
  });

  // Panneau de réservation (maquette) : s'ouvre à droite, un tiers de l'écran ; seule la fermeture fonctionne
  var panneau=document.querySelector('.panneau-resa');
  if(panneau){
    var MOIS=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    var auj=new Date(),an=auj.getFullYear(),mo=auj.getMonth();
    panneau.querySelector('.pr-mois-nom').textContent=MOIS[mo]+' '+an;
    var cases='',decal=(new Date(an,mo,1).getDay()+6)%7,nb=new Date(an,mo+1,0).getDate(),i;
    for(i=0;i<decal;i++)cases+='<span></span>';
    for(i=1;i<=nb;i++)cases+='<span'+(i<auj.getDate()?' class="passe"':'')+'>'+i+'</span>';
    panneau.querySelector('.pr-jours').innerHTML=cases;
    var ouvrePanneau=function(){
      Object.keys(modales).forEach(function(k){if(modales[k].classList.contains('ouverte'))ferme(modales[k]);});
      document.body.classList.add('panneau-ouvert');panneau.setAttribute('aria-hidden','false');
      document.documentElement.style.overflow='hidden';panneau.querySelector('.pr-fermer').focus();
    };
    var fermePanneau=function(){
      document.body.classList.remove('panneau-ouvert');panneau.setAttribute('aria-hidden','true');
      document.documentElement.style.overflow='';
    };
    document.addEventListener('click',function(e){
      if(e.target.closest('[data-reserver]')){e.preventDefault();ouvrePanneau();}
      else if(e.target.closest('.pr-fermer')||e.target.classList.contains('panneau-fond'))fermePanneau();
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape')fermePanneau();});
  }

  // Avis du contact : un nouvel avis toutes les 2 secondes
  var avisAuto=[].slice.call(document.querySelectorAll('.avis-auto .avis'));
  if(avisAuto.length>1){var a=0;setInterval(function(){avisAuto[a].classList.remove('actif');a=(a+1)%avisAuto.length;avisAuto[a].classList.add('actif');},2000);}

  // Formulaire (maquette : rien n'est envoyé)
  document.querySelectorAll('form.formulaire').forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();f.classList.add('envoye');f.querySelector('.merci').scrollIntoView({block:'nearest',behavior:'smooth'});});
  });
})();
