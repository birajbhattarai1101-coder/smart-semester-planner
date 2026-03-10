import { useEffect } from "react";

const JOURNAL_BG = "https://i.ibb.co/kVN7P4t7/Screenshot-2026-03-10-111457.png";

export default function OnboardingPage() {
  const navigate = (path) => window.location.href = path;
  const phases = [
    { phase:"PHASE 01", title:"Define Capacity", desc:"Tell us how many hours you can truly give to your studies each week.", active:true },
    { phase:"PHASE 02", title:"Sync Syllabus", desc:"Upload your assignments and labs to populate your task engine.", active:false },
    { phase:"PHASE 03", title:"Generate Schedule", desc:"Balance your day, boost your results.", active:false },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pageTurn { 0% { transform: rotate(-1deg) translateX(0px); opacity: 0.22; } 50% { transform: rotate(0.5deg) translateX(6px); opacity: 0.28; } 100% { transform: rotate(-1deg) translateX(0px); opacity: 0.22; } }
        @keyframes floatDot { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
        .fadeup { animation: fadeUp 0.7s ease both; }
        .journalbg { animation: pageTurn 8s ease-in-out infinite; }
        .fdot { animation: floatDot 3s ease-in-out infinite; }
        .gbtn:hover { transform: translateY(-2px) !important; box-shadow: 0 12px 32px rgba(44,24,16,0.3) !important; }
      `}</style>

      <div style={{ display:"flex", height:"100vh", width:"100%", fontFamily:"sans-serif", overflow:"hidden" }}>

        {/* LEFT */}
        <div style={{ flex:1, background:"#FAF8F4", position:"relative", display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 72px", overflow:"hidden" }}>
          <img src={JOURNAL_BG} alt="" className="journalbg" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:0.22, mixBlendMode:"multiply", filter:"sepia(40%) brightness(1.05) contrast(0.9)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(250,248,244,0.55) 0%,rgba(250,248,244,0.25) 60%,rgba(250,248,244,0.7) 100%)", pointerEvents:"none" }} />
          {[[8,12],[88,20],[15,78],[82,68],[50,88]].map(([x,y],i)=>(
            <div key={i} className="fdot" style={{ position:"absolute", left:`${x}%`, top:`${y}%`, width:"6px", height:"6px", borderRadius:"50%", background:"#B8862E", opacity:0.3, animationDelay:`${i*0.6}s`, pointerEvents:"none" }} />
          ))}
          <div style={{ position:"relative", zIndex:1 }}>
            <div className="fadeup" style={{ animationDelay:"0.1s", marginBottom:"36px", fontSize:"11px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"#2C1810" }}>● SMART SEMESTER</div>
            <div className="fadeup" style={{ animationDelay:"0.2s", marginBottom:"12px", fontSize:"12px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"#B8862E" }}>REGISTRATION COMPLETE</div>
            <h1 className="fadeup" style={{ animationDelay:"0.3s", fontSize:"60px", fontWeight:900, color:"#2C1810", lineHeight:1.05, marginBottom:"20px", letterSpacing:"-2px" }}>
              Own every<br/>study <span style={{ color:"#B8862E", borderBottom:"3px solid #B8862E", paddingBottom:"2px" }}>second.</span>
            </h1>
            <p className="fadeup" style={{ animationDelay:"0.4s", fontSize:"15px", color:"#6B5A4E", lineHeight:1.8, marginBottom:"52px", maxWidth:"380px" }}>
              Welcome to a smarter way of learning. We have created a space where your goals meet your actual availability.
            </p>
            <button className="gbtn" onClick={() => navigate("/dashboard")} style={{ display:"inline-flex", alignItems:"center", gap:"12px", background:"#2C1810", color:"white", border:"none", padding:"16px 36px", borderRadius:"8px", fontSize:"15px", fontWeight:700, cursor:"pointer", boxShadow:"0 8px 24px rgba(44,24,16,0.2)", transition:"transform 0.15s, box-shadow 0.15s" }}>
              Get Started →
            </button>
            <div style={{ marginTop:"52px", paddingTop:"24px", borderTop:"1px solid rgba(44,24,16,0.08)" }}>
              <p style={{ fontSize:"12px", color:"#B8862E", fontStyle:"italic", margin:0 }}>"Your semester, engineered for excellence."</p>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ width:"38%", background:"#2C1810", display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 48px" }}>
          <div style={{ display:"flex", flexDirection:"column" }}>
            {phases.map((item, i) => (
              <div key={i} style={{ display:"flex", gap:"20px", flex:"0 0 auto" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", width:"14px", flexShrink:0 }}>
                  <div style={{ width:"14px", height:"14px", borderRadius:"50%", background:item.active?"#B8862E":"transparent", border:item.active?"none":"2px solid rgba(255,255,255,0.3)", flexShrink:0 }} />
                  {i < 2 && <div style={{ width:"1px", flexGrow:1, minHeight:"40px", background:"rgba(255,255,255,0.15)", marginTop:"6px" }} />}
                </div>
                <div style={{ textAlign:"left", paddingBottom: i < 2 ? "32px" : "0" }}>
                  <div style={{ fontSize:"11px", fontWeight:700, letterSpacing:"2px", textTransform:"uppercase", color:"#B8862E", marginBottom:"6px" }}>{item.phase}</div>
                  <div style={{ fontSize:"18px", fontWeight:800, color:"white", marginBottom:"6px" }}>{item.title}</div>
                  <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
