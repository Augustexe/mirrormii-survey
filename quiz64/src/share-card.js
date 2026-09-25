/** A local image containing only a game nickname and invitation. Never raw answers. */
export async function downloadChallengeImage(card) {
  const canvas = document.createElement('canvas'); canvas.width=1080; canvas.height=1350;
  const ctx=canvas.getContext('2d');
  if(!ctx) throw new Error('Image export unavailable');
  const gradient=ctx.createLinearGradient(0,0,1080,1350);gradient.addColorStop(0,'#fffdfa');gradient.addColorStop(1,'#ece2fa');ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,1350);
  ctx.strokeStyle='#c9b7e6';ctx.lineWidth=2;ctx.strokeRect(56,56,968,1238);
  ctx.fillStyle='#70509b';ctx.font='700 24px sans-serif';ctx.fillText('GENII / MY UNOFFICIAL ALTER EGO',100,135);
  ctx.beginPath();ctx.ellipse(540,400,235,130,-.2,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(540,400,175,175,0,0,Math.PI*2);ctx.stroke();
  ctx.font='90px serif';ctx.textAlign='center';ctx.fillStyle='#9271be';ctx.fillText('✦',540,430);
  ctx.textAlign='left';ctx.fillStyle='#292033';ctx.font='bold 76px sans-serif';
  const lines=[];let line='';for(const word of card.title.split(' ')){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>880 && line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
  lines.forEach((value,i)=>ctx.fillText(value,100,670+i*88));
  ctx.fillStyle='#6d528c';ctx.font='32px sans-serif';ctx.fillText('What would Genii call you?',100,1080);ctx.font='24px sans-serif';ctx.fillText('Take your own turn. Compare titles.',100,1135);ctx.font='20px sans-serif';ctx.fillText('A personality game. Private answers stay private.',100,1220);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('Image export unavailable');
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='my-genii-character.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
