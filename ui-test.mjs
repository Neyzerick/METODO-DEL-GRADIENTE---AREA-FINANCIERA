import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const numerics=fs.readFileSync(new URL('./numerics.js',import.meta.url),'utf8');
const app=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8');

class ClassList{
  constructor(value=''){this.values=new Set(value.split(/\s+/).filter(Boolean));}
  toggle(name,force){if(force===undefined)force=!this.values.has(name);force?this.values.add(name):this.values.delete(name);return force;}
  add(name){this.values.add(name);}
  remove(name){this.values.delete(name);}
  contains(name){return this.values.has(name);}
}

class Element{
  constructor(id,{classes='',dataset={}}={}){this.id=id;this.dataset={...dataset};this.classList=new ClassList(classes);this.style={};this.value='';this.textContent='';this.innerHTML='';this.listeners={};this.scrolled=false;}
  addEventListener(type,handler){(this.listeners[type]??=[]).push(handler);}
  dispatch(type,event={}){for(const handler of this.listeners[type]??[])handler({target:this,...event});}
  click(){this.dispatch('click');}
  matches(selector){return selector==='input';}
  scrollIntoView(){this.scrolled=true;}
}

const elements=new Map();
for(const match of html.matchAll(/id="([^"]+)"/g))elements.set(match[1],new Element(match[1]));
const scenarios=[];
for(const match of html.matchAll(/<button class="([^"]*scenario[^"]*)" data-scene="([^"]+)"/g)){
  const element=new Element(`scenario-${match[2]}`,{classes:match[1],dataset:{scene:match[2]}});
  scenarios.push(element);
}

elements.get('dimension').value='4';
elements.get('tol').value='0.000001';
elements.get('maxiter').value='100';
elements.get('preconditioner').value='jacobi';

const document={
  getElementById:id=>elements.get(id)??null,
  querySelectorAll:selector=>selector==='.scenario'?scenarios:[]
};

let clock=0;
const context=vm.createContext({
  console,document,Intl,Math,Number,String,Array,Object,Set,Map,
  performance:{now:()=>clock},
  requestAnimationFrame:callback=>{clock+=500;callback(clock);return clock;},
  cancelAnimationFrame:()=>{}
});

vm.runInContext(numerics,context,{filename:'numerics.js'});
vm.runInContext(app,context,{filename:'app.js'});

assert.match(elements.get('total-result').textContent,/^Bs /);
assert.equal(elements.get('pcg-iterations').textContent,4);
assert.match(elements.get('validation').textContent,/Matriz simétrica y definida positiva/);
console.log('OK carga directa y cálculo inicial');

scenarios.find(button=>button.dataset.scene==='estres').click();
assert.ok(scenarios.find(button=>button.dataset.scene==='estres').classList.contains('active'));
assert.equal(elements.get('pcg-iterations').textContent,4);
console.log('OK botón escenario de estrés');

scenarios.find(button=>button.dataset.scene==='mal').click();
assert.ok(scenarios.find(button=>button.dataset.scene==='mal').classList.contains('active'));
assert.equal(elements.get('pcg-iterations').textContent,2);
console.log('OK botón escenario mal condicionado');

elements.get('calculate').click();
assert.match(elements.get('validation').textContent,/Cálculo ejecutado correctamente/);
assert.equal(elements.get('escenarios').scrolled,true);
console.log('OK botón Calcular ahora');

elements.get('run-tests').click();
assert.match(elements.get('qa-summary').innerHTML,/5 de 5 pruebas superadas/);
assert.match(elements.get('qa-table').innerHTML,/QA-04/);
console.log('OK botón Ejecutar pruebas');

elements.get('animate').click();
assert.match(elements.get('iteration-caption').textContent,/Reproduciendo iteración/);
console.log('OK botón Reproducir recorrido');

elements.get('matrix-inputs').dispatch('input',{target:{matches:selector=>selector==='input',value:'0',dataset:{role:'A',i:'0',j:'1'}}});
assert.match(elements.get('validation').textContent,/no es simétrica/);
assert.ok(elements.get('validation').classList.contains('invalid'));
console.log('OK validación de matriz no simétrica');

elements.get('reset').click();
assert.match(elements.get('validation').textContent,/Matriz simétrica y definida positiva/);
assert.equal(elements.get('pcg-iterations').textContent,2);
console.log('OK botón Restablecer');

elements.get('dimension').value='5';
elements.get('dimension').dispatch('change');
assert.match(elements.get('system-display').innerHTML,/ℝ5×5/);
console.log('OK cambio de dimensión y recálculo');

console.log('OK interfaz completa');
