export type ActionKind = 'show' | 'hide' | 'changeText' | 'playSound' | 'goToCard';
export type Action = { type: ActionKind; target?: string; value?: string };
export type ElementKind = 'text' | 'button' | 'image';
export type DeckElement = { id: string; kind: ElementKind; x: number; y: number; w: number; h: number; text: string; src?: string; hidden?: boolean; action?: Action };
export type Card = { id: string; title: string; color: string; elements: DeckElement[] };
export type Project = { format: 'local-sketch-deck'; version: 1; name: string; cards: Card[] };

let serial = 0;
export const uid = (prefix = 'item') => `${prefix}-${Date.now().toString(36)}-${(++serial).toString(36)}`;
export const blankProject = (): Project => ({ format: 'local-sketch-deck', version: 1, name: 'Untitled deck', cards: [{ id: uid('card'), title: 'First card', color: '#fff6df', elements: [] }] });
export const sampleProject = (): Project => ({
  format: 'local-sketch-deck', version: 1, name: 'Pocket constellation', cards: [
    { id: 'card-welcome', title: 'Wake', color: '#fff6df', elements: [{ id: 'wake-title', kind: 'text', x: 12, y: 18, w: 76, h: 18, text: 'A light wakes up.', action: { type: 'changeText', target: 'wake-title', value: 'The light knows your name.' } }, { id: 'wake-go', kind: 'button', x: 12, y: 60, w: 38, h: 12, text: 'Follow it →', action: { type: 'goToCard', target: 'card-path' } }] },
    { id: 'card-path', title: 'Path', color: '#d7fff7', elements: [{ id: 'path-copy', kind: 'text', x: 12, y: 18, w: 76, h: 17, text: 'A cyan path is waiting.', action: { type: 'hide', target: 'path-copy' } }, { id: 'path-sound', kind: 'button', x: 12, y: 60, w: 44, h: 12, text: 'Ring the star', action: { type: 'playSound' } }, { id: 'path-go', kind: 'button', x: 58, y: 60, w: 28, h: 12, text: 'Arrive →', action: { type: 'goToCard', target: 'card-end' } }] },
    { id: 'card-end', title: 'Arrive', color: '#ffe0aa', elements: [{ id: 'end-copy', kind: 'text', x: 12, y: 23, w: 76, h: 18, text: 'You made a tiny world.', action: { type: 'show', target: 'end-note' } }, { id: 'end-note', kind: 'text', x: 12, y: 52, w: 76, h: 12, text: 'Try the first line.', hidden: true }, { id: 'end-go', kind: 'button', x: 12, y: 70, w: 34, h: 12, text: 'Again ↺', action: { type: 'goToCard', target: 'card-welcome' } }] }
  ]
});

export function validateProject(value: unknown): value is Project {
  const v = value as Partial<Project>;
  return !!v && v.format === 'local-sketch-deck' && v.version === 1 && typeof v.name === 'string' && Array.isArray(v.cards) && v.cards.length > 0 && v.cards.every(c => c && typeof c.id === 'string' && Array.isArray(c.elements));
}

export const projectJson = (project: Project) => JSON.stringify(project, null, 2);

export function exportHtml(project: Project): string {
  const safe = JSON.stringify(project).replace(/</g, '\\u003c');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(project.name)}</title><style>body{margin:0;background:#111221;color:#151629;font:18px system-ui,sans-serif;display:grid;place-items:center;min-height:100vh}.card{width:min(92vw,720px);aspect-ratio:1.5;border:3px solid #151629;box-shadow:8px 8px #77f7e4;position:relative;overflow:hidden}.el{position:absolute;box-sizing:border-box;font:inherit}.text{line-height:1.25;white-space:pre-wrap}.button{border:2px solid #151629;background:#ff7a8a;color:#151629;font-weight:700;cursor:pointer;padding:4px}.button:focus-visible{outline:4px solid #ffd166;outline-offset:2px}.hint{color:#fff6df;margin-top:22px;font-size:14px}</style></head><body><main><div id="card" class="card" aria-live="polite"></div><p class="hint">Made locally with Local Sketch Deck</p></main><script>const deck=${safe};let card=0, state={};const $=s=>document.querySelector(s);function tone(){try{const a=new AudioContext();const o=a.createOscillator(),g=a.createGain();o.frequency.value=660;g.gain.setValueAtTime(.06,a.currentTime);g.gain.exponentialRampToValueAtTime(.001,a.currentTime+.16);o.connect(g).connect(a.destination);o.start();o.stop(a.currentTime+.16)}catch(e){}}function draw(){const c=deck.cards[card], root=$('#card');root.style.background=c.color;root.replaceChildren(...c.elements.filter(e=>!state[e.id]?.hidden).map(e=>{let n=e.kind==='button'?document.createElement('button'):document.createElement('div');n.className='el '+e.kind;n.style.cssText='left:'+e.x+'%;top:'+e.y+'%;width:'+e.w+'%;height:'+e.h+'%';n.textContent=state[e.id]?.text??e.text;if(e.kind==='image'&&e.src){n=document.createElement('img');n.className='el';n.src=e.src;n.alt=e.text;n.style.cssText='left:'+e.x+'%;top:'+e.y+'%;width:'+e.w+'%;height:'+e.h+'%;object-fit:cover'}if(e.action)n.onclick=()=>act(e.action);return n}))}function act(a){if(a.type==='goToCard'){let i=deck.cards.findIndex(c=>c.id===a.target);if(i>=0){card=i;state={}}}else if(a.type==='playSound')tone();else if(a.target){state[a.target]={...(state[a.target]||{}),...(a.type==='show'?{hidden:false}:a.type==='hide'?{hidden:true}:a.type==='changeText'?{text:a.value||''}:{})}}draw()}draw()</script></body></html>`;
}
const escapeHtml = (s: string) => s.replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]!));
