import {describe,it,expect} from 'vitest';
import {createInitialState} from '../src/engine';
import {parseRescueIntent} from '../src/rescue-intent';
const state=createInitialState();
describe('bounded rescue conversation',()=>{
  it('handles the English and Spanish two-resource hypothetical without an apply intent',()=>{
    for(const phrase of ["What if I'm missing B7 and my screwdriver?",'¿Qué pasaría si me faltaran B7 y el destornillador?']){
      expect(parseRescueIntent(phrase,state)).toMatchObject({tool:'preview_scenario',args:{changes:{missingParts:['B7'],unavailableTools:['screwdriver']}}});
    }
  });
  it('recovers only one resource while preserving the other hypothetical shortage',()=>{
    const context={changes:{missingParts:['B7'],unavailableTools:['screwdriver']}};
    for(const text of ['Show me what changes if I recover B7.','¿Qué cambia si recupero solamente B7?'])expect(parseRescueIntent(text,state,context)).toMatchObject({tool:'preview_scenario',args:{changes:{recoveredParts:['B7'],missingParts:[],unavailableTools:['screwdriver']}}});
  });
  it('explains the selected hypothetical instead of silently using actual inventory',()=>{
    const changes={missingParts:['B7']};expect(parseRescueIntent('Why is step 5 blocked?',state,{changes})).toEqual({tool:'explain_recovery',args:{stepId:5,changes}});
    expect(parseRescueIntent('¿Por qué no puedo completar la cubierta?',state)).toEqual({tool:'explain_recovery',args:{stepId:5}});
  });
  it('compares arbitrary configured resources using the active catalog',()=>{
    expect(parseRescueIntent('Compare missing O4 versus missing O5 and screwdriver',createInitialState('organizer'))).toMatchObject({tool:'compare_scenarios',args:{scenarios:[{id:'A',changes:{missingParts:['O4']}},{id:'B',changes:{missingParts:['O5'],unavailableTools:['screwdriver']}}]}});
  });
  it('requires clarification for unknowns, negation ambiguity and compound actions, never a partial tool call',()=>{
    for(const text of ['What if I am missing B7 and a hammer?',"What if I'm not missing B7?",'What if missing B7 and restore A1','What if missing B7; complete step 5','What if missing B7 and X999','What if missing B7 and B7'])expect(parseRescueIntent(text,state)).toHaveProperty('message');
    expect(parseRescueIntent('Me falta B7 y el destornillador',state)).toBeNull();
  });
  it('an approval request only opens review and a question never approves',()=>{
    expect(parseRescueIntent('Apply this scenario',state)).toEqual({approval:true});
    expect(parseRescueIntent('Apply this scenario?',state)).toHaveProperty('message');
    expect(parseRescueIntent('yes',state)).toBeNull();
  });
  it('resolves contextual resources and active alternatives without touching input',()=>{
    const selected={...state,selectedPart:'B7'};const before=JSON.stringify(selected);
    expect(parseRescueIntent('What if I am missing that part?',selected)).toMatchObject({tool:'preview_scenario',args:{changes:{missingParts:['B7']}}});
    expect(parseRescueIntent('What can I still do?',selected)).toEqual({tool:'preview_scenario',args:{changes:{}}});
    expect(JSON.stringify(selected)).toBe(before);
  });
});
