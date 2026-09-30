(function(){
  "use strict";

  const SUPABASE_URL="https://hvqjtsphlisboukskmqa.supabase.co";
  const SUPABASE_KEY="sb_publishable_w0baOVJQFIQUu3ixZ-dKFQ_hHHTt9Ff";
  const AUTH_URL=SUPABASE_URL+"/auth/v1";

  if(window.__presenceAuthInitialized)return;
  window.__presenceAuthInitialized=true;

  const byId=id=>document.getElementById(id);
  const setMessage=msg=>{
    const el=byId("authMsg");
    if(el)el.textContent=msg||"";
  };

  function isStudentJoin(){
    try{return new URLSearchParams(window.location.search).has("join")}
    catch(e){return false}
  }
  if(isStudentJoin())return;

  let mode="login";

  function setMode(next){
    mode=next==="signup"?"signup":"login";
    document.querySelectorAll(".tab").forEach(tab=>{
      tab.classList.toggle("active",tab.dataset.mode===mode);
      tab.setAttribute("aria-selected",String(tab.dataset.mode===mode));
    });
    const signup=byId("signup");
    const button=byId("authBtn");
    if(signup)signup.classList.toggle("hidden",mode==="login");
    if(button){
      button.type="submit";
      button.textContent=mode==="login"?"Se connecter":"Créer un compte";
    }
    setMessage("");
  }

  async function requestAuth(path,payload){
    let response;
    try{
      response=await fetch(AUTH_URL+path,{
        method:"POST",
        headers:{
          apikey:SUPABASE_KEY,
          "Content-Type":"application/json"
        },
        body:JSON.stringify(payload),
        cache:"no-store"
      });
    }catch(error){
      throw new Error("Impossible de contacter Supabase. Vérifiez votre connexion Internet puis réessayez.");
    }

    const raw=await response.text();
    let data=null;
    try{data=raw?JSON.parse(raw):null}catch(e){data=raw}

    if(!response.ok){
      const message=data?.msg||data?.message||data?.error_description||data?.error;
      const error=new Error(message||("Erreur d’authentification ("+response.status+")."));
      error.status=response.status;
      error.code=data?.code||data?.error_code||"";
      throw error;
    }
    return data;
  }

  function saveSession(data){
    if(!data?.access_token||!data?.user){
      localStorage.removeItem("presence_session");
      return false;
    }
    const session={
      access_token:data.access_token,
      refresh_token:data.refresh_token||null,
      token_type:data.token_type||"bearer",
      expires_in:data.expires_in||null,
      expires_at:data.expires_at||null,
      user:data.user
    };
    localStorage.setItem("presence_session",JSON.stringify(session));
    return true;
  }

  function friendlyAuthError(error,action){
    const message=String(error?.message||"");
    const lower=message.toLowerCase();
    if(lower.includes("invalid login credentials"))
      return "Adresse e-mail ou mot de passe incorrect.";
    if(lower.includes("email not confirmed"))
      return "Votre e-mail n’est pas encore confirmé. Vérifiez votre boîte de réception puis reconnectez-vous.";
    if(lower.includes("user already registered"))
      return "Un compte existe déjà avec cette adresse. Utilisez « Se connecter ».";
    if(lower.includes("password should be at least"))
      return "Le mot de passe doit contenir au moins 6 caractères.";
    if(lower.includes("rate limit"))
      return "Trop de tentatives. Attendez quelques instants puis réessayez.";
    if(action==="signup")
      return message||"Impossible de créer le compte. Réessayez.";
    return message||"Impossible de vous connecter. Réessayez.";
  }

  async function handleSubmit(event){
    event.preventDefault();
    event.stopImmediatePropagation();

    const email=(byId("email")?.value||"").trim().toLowerCase();
    const password=byId("password")?.value||"";
    const name=(byId("name")?.value||"").trim();
    const button=byId("authBtn");

    if(!email){
      setMessage("Saisissez votre adresse e-mail.");
      return false;
    }
    if(password.length<6){
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return false;
    }
    if(mode==="signup"&&!name){
      setMessage("Saisissez votre nom complet.");
      return false;
    }

    if(button){
      button.disabled=true;
      button.textContent=mode==="login"?"Connexion…":"Création du compte…";
    }
    setMessage("");

    try{
      if(mode==="login"){
        const data=await requestAuth("/token?grant_type=password",{email,password});
        if(!saveSession(data))
          throw new Error("Supabase a répondu sans session utilisateur.");
        setMessage("Connexion réussie…");
        window.dispatchEvent(new CustomEvent("presence-authenticated",{detail:data}));
        return false;
      }

      const data=await requestAuth("/signup",{
        email,
        password,
        data:{full_name:name,role:"teacher"}
      });

      if(!data?.access_token){
        localStorage.removeItem("presence_session");
        setMessage("Compte créé. Vérifiez votre e-mail pour confirmer le compte, puis utilisez « Se connecter ».");
        setMode("login");
        const emailInput=byId("email");
        if(emailInput)emailInput.value=email;
        return false;
      }

      if(!saveSession(data))
        throw new Error("Le compte a été créé, mais Supabase n’a pas renvoyé de session.");

      setMessage("Compte créé avec succès…");
      window.dispatchEvent(new Event("presence-authenticated"));
      return false;
    }catch(error){
      localStorage.removeItem("presence_session");
      setMessage(friendlyAuthError(error,mode));
      return false;
    }finally{
      if(button){
        button.disabled=false;
        button.textContent=mode==="login"?"Se connecter":"Créer un compte";
      }
    }
  }

  function init(){
    const form=byId("authForm");
    if(!form)return;

    document.querySelectorAll(".tab").forEach(tab=>{
      tab.type="button";
      tab.onclick=()=>setMode(tab.dataset.mode||"login");
    });

    form.onsubmit=handleSubmit;
    form.dataset.authBound="1";
    setMode(mode);
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init,{once:true});
  }else{
    init();
  }
})();