(function(){
  "use strict";
  const SUPABASE_URL="https://hvqjtsphlisboukskmqa.supabase.co";
  const SUPABASE_KEY="sb_publishable_w0baOVJQFIQUu3ixZ-dKFQ_hHHTt9Ff";
  const AUTH_URL=SUPABASE_URL+"/auth/v1";

  const byId=id=>document.getElementById(id);
  const setMessage=msg=>{
    const el=byId("authMsg");
    if(el) el.textContent=msg||"";
  };

  function isStudentJoin(){
    try{return new URLSearchParams(window.location.search).has("join");}
    catch(e){return false;}
  }

  if(isStudentJoin()) return;

  let mode="login";

  function setMode(next){
    mode=next;
    document.querySelectorAll(".tab").forEach(tab=>{
      tab.classList.toggle("active",tab.dataset.mode===mode);
    });
    const signup=byId("signup");
    const button=byId("authBtn");
    if(signup) signup.classList.toggle("hidden",mode==="login");
    if(button) button.textContent=mode==="login"?"Sign in":"Create account";
  }

  async function requestAuth(path,payload){
    const response=await fetch(AUTH_URL+path,{
      method:"POST",
      headers:{
        apikey:SUPABASE_KEY,
        "Content-Type":"application/json"
      },
      body:JSON.stringify(payload)
    });
    const text=await response.text();
    let data=null;
    try{data=text?JSON.parse(text):null}catch(e){data=text;}
    if(!response.ok){
      throw new Error(data?.msg||data?.message||data?.error_description||data?.error||"Authentication failed.");
    }
    return data;
  }

  function saveSession(data){
    if(data?.access_token){
      localStorage.setItem("presence_session",JSON.stringify(data));
      return true;
    }
    return false;
  }

  document.addEventListener("DOMContentLoaded",()=>{
    document.querySelectorAll(".tab").forEach(tab=>{
      tab.addEventListener("click",()=>setMode(tab.dataset.mode));
    });

    const form=byId("authForm");
    if(!form) return;

    form.addEventListener("submit",async event=>{
      event.preventDefault();
      event.stopImmediatePropagation();

      const email=byId("email")?.value.trim();
      const password=byId("password")?.value||"";
      const name=byId("name")?.value.trim()||"";
      const button=byId("authBtn");

      if(!email){setMessage("Enter your email.");return;}
      if(password.length<6){setMessage("Password must be at least 6 characters.");return;}
      if(mode==="signup" && !name){setMessage("Enter your full name.");return;}

      if(button){
        button.disabled=true;
        button.textContent=mode==="login"?"Signing in…":"Creating account…";
      }
      setMessage("");

      try{
        const data=mode==="login"
          ?await requestAuth("/token?grant_type=password",{email,password})
          :await requestAuth("/signup",{email,password,data:{full_name:name,role:"teacher"}});

        if(mode==="signup" && !data?.access_token){
          setMessage("Account created. Check your email to confirm it, then sign in.");
          return;
        }

        if(!saveSession(data)){
          setMessage("Authentication succeeded but no session was returned. Please try again.");
          return;
        }

        window.location.reload();
      }catch(error){
        setMessage(error?.message||"Could not sign in. Please check your email and password.");
      }finally{
        if(button){
          button.disabled=false;
          button.textContent=mode==="login"?"Sign in":"Create account";
        }
      }
    },true);
  });
})();