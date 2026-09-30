# usage: REPEAT=n python3 panel.py <round> <items.json>
import json,sys,subprocess,os,random,concurrent.futures as cf
S=os.path.dirname(os.path.abspath(__file__))
rnd=sys.argv[1]; items=json.load(open(sys.argv[2]))
HEAD='''You are a panel of 6 cold readers aged 20 to 35 in the US and Canada, mixed genders: R1 a progressive activist, R2 a religious conservative, R3 an ESL speaker (first language Spanish or Mandarin), R4 a Gen Z TikTok user, R5 a busy nurse, R6 an engineer. You see each piece of text ONLY as it appears on a phone on the result screen of a personality quiz game called MirrorMii, the kind of result people screenshot and post to their story. You are told WHERE the text sits on the screen. Each reader imagines the text is THEIR OWN result and scores privately and honestly. Do not be kind: text that needs decoding, is vague, sounds like a roast, feels generic, or could mean several things does not score well.
- c = clear, 1 to 5 (5 = I get it instantly with no decoding; 4 = I get it but pause; 3 = I can guess after a second; 1 = no idea)
- h = hurt, 1 to 5 (1 = nobody would mind; 5 = someone would feel judged, boxed in, insulted, or labeled by politics, religion, gender or identity)
- s = would post, 1 to 5 (5 = I'd happily post this about myself or tag a friend in it; 1 = I'd never post it)
Also give m = the most common reading of what it says about the person (8 words max) and x = the most likely misread ("none" if none).
Output ONLY JSON, no prose: {"r":[{"id":"<id>","m":"...","x":"...","c":[6 ints],"h":[6 ints],"s":[6 ints]}]} with exactly one entry per item below, in order, with the same ids.

ITEMS (id | where it sits | text):
'''
B=int(os.environ.get('B','50')); REP=int(os.environ.get('REPEAT','1'))
batches=[]
for r in range(REP):
    order=items[:] if r==0 else random.Random(r).sample(items,len(items))
    batches+=[order[i:i+B] for i in range(0,len(order),B)]
def run(bi):
    b=batches[bi]
    prompt=HEAD+'\n'.join(f'{it["id"]} | {it["where"]} | {it["label"]}' for it in b)
    out=f'{S}/panel/{rnd}-b{bi}.json'
    if os.path.exists(out) and os.path.getsize(out)>10: return
    for attempt in range(2):
        with open(f'{S}/panel/{rnd}-b{bi}.log','w') as log:
            try: subprocess.run(['/Users/jerryzhang/Workspace-Draft/system/bin/codex','exec','--skip-git-repo-check','--ephemeral','-s','read-only','-C',S,'-o',out,prompt],stdin=subprocess.DEVNULL,stdout=log,stderr=subprocess.STDOUT,timeout=1500)
            except Exception as e: print('timeout',bi,e,flush=True)
        try:
            txt=open(out).read(); txt=txt[txt.index('{'):txt.rindex('}')+1]; json.loads(txt); return
        except Exception as e:
            print('retry',bi,e,flush=True)
            try: os.remove(out)
            except: pass
with cf.ThreadPoolExecutor(min(14,len(batches))) as ex: list(ex.map(run,range(len(batches))))
res={}
for bi in range(len(batches)):
    try:
        txt=open(f'{S}/panel/{rnd}-b{bi}.json').read(); txt=txt[txt.index('{'):txt.rindex('}')+1]
        for r in json.loads(txt)['r']:
            e=res.setdefault(r['id'],{'m':r.get('m'),'x':r.get('x'),'c':[],'h':[],'s':[]})
            e['c']+=r['c']; e['h']+=r['h']; e['s']+=r['s']
    except Exception as e: print('fail batch',bi,e)
avg=lambda a: round(sum(a)/len(a),2) if a else None
out=[]
for it in items:
    r=res.get(it['id'])
    if not r: out.append({**it,'missing':True}); continue
    c,h,s=avg(r['c']),avg(r['h']),avg(r['s'])
    ok=c>=4.5 and h<=2 and (s>=3.5 if it.get('kind')=='line' else True)
    out.append({**it,'meaning':r['m'],'misread':r['x'],'clear':c,'hurt':h,'share':s,'readers':len(r['c']),'pass':ok})
json.dump({'round':rnd,'items':out},open(f'{S}/panel/{rnd}-merged.json','w'),indent=1)
print('scored',sum(1 for o in out if 'clear' in o),'of',len(out),'pass',sum(1 for o in out if o.get('pass')))
