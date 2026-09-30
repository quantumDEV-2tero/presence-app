(function(){
  "use strict";

  const SUPABASE_URL="https://hvqjtsphlisboukskmqa.supabase.co";
  const SUPABASE_KEY="sb_publishable_w0baOVJQFIQUu3ixZ-dKFQ_hHHTt9Ff";
  const AUTH_URL=SUPABASE_URL+"/auth/v1";

  if(window.__presenceAuthInitialized)return;
  window.__presenceAuthInitialized=true;

  const byId=id=>document.getElementById(id);
  const setMessage=msg=>{const el=byId("authMsg");if(el)el.textContent=msg||""};

  function isStudentJoin(){
    try{return new URLSearchParams(window.location.search).has("join")}
    catch(e){return false}
  }

  if(isStudentJoin())return;

  let mode="login";

  function setMode(next){
    mode=next;
    document.querySelectorAll(".tab").forEach(tab=>{
      tab.classList.toggle("active",tab.dataset.mode===mode);
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
        headers:{apikey:SUPABASE_KEY,"Content-Type":"application/json"},
        body:JSON.stringify(payload),
        cache:"no-store"
      });
    }catch(error){
      throw new Error("Impossible de contacter le service de connexion. Vérifiez votre connexion Internet et réessayez.");
    }

    const body=await response.text();
    let data=null;
    try{data=body?JSON.parse(body):null}catch(e){data=body}

    if(!response.ok){
      const message=data?.msg||data?.message||data?.error_description||data?.error;
      throw new Error(message||("Échec de l’authentification ("+response.status+")."));
    }
    return data;
  }

  function saveSession(data){
    if(!data?.access_token)return false;
    localStorage.setItem("presence_session",JSON.stringify(data));
    return true;
  }

  async function handleSubmit(event){
    event.preventDefault();
    event.stopPropagation();

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
        if(!saveSession(data)){
          throw new Error("La connexion a réussi, mais aucune session n’a été reçue.");
        }
        window.location.href=window.location.pathname;
        return false;
      }

      const data=await requestAuth("/signup",{
        email,
        password,
        data:{full_name:name,role:"teacher"}
      });

      if(!data?.access_token){
        setMessage("Compte créé. Vérifiez votre e-mail pour confirmer votre compte, puis connectez-vous.");
        setMode("login");
        const emailInput=byId("email");
        if(emailInput)emailInput.value=email;
        return false;
      }

      if(!saveSession(data)){
        throw new Error("Le compte a été créé, mais aucune session n’a été reçue.");
      }
      window.location.href=window.location.pathname;
      return false;
    }catch(error){
      setMessage(error?.message||"Impossible de traiter la demande. Vérifiez vos informations et réessayez.");
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