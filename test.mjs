import {scenarioData,evaluate,validate} from './numerics.mjs';
import assert from 'node:assert/strict';
const scenarios=['ideal','estres','mal'];
for(const name of scenarios){const result=evaluate(scenarioData(name));assert.equal(result.error,undefined);assert.ok(result.cg.converged&&result.pcg.converged);assert.ok(result.refResidual<1e-10);console.log('OK escenario:',name,`GC=${result.cg.iterations} GCP=${result.pcg.iterations}`);}
const a=scenarioData('ideal');a.A[0][1]+=.2;assert.ok(validate(a)?.includes('simétrica'));const b=scenarioData('ideal');b.A[0][0]=-1;assert.ok(validate(b));console.log('OK matrices inválidas');
const c=scenarioData('ideal'),x1=evaluate(c).ref[0];c.b[0]+=.25;assert.ok(Math.abs(evaluate(c).ref[0]-x1)>1e-5);console.log('OK edición dinámica');
const r=evaluate(scenarioData('mal'));assert.ok(r.pcg.iterations<=r.cg.iterations);console.log('OK comparación GCP <= GC');
const z=scenarioData('ideal');z.b.fill(0);assert.equal(evaluate(z).pcg.residual,0);console.log('OK b=0');
