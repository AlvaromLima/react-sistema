import { createContext, useState, useEffect } from 'react';
import firebase from '../services/firebaseConnection';
import { toast } from 'react-toastify';

export const AuthContext = createContext({});

function AuthProvider({ children }){

  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{

    function loadStorage(){
      const storageUser = localStorage.getItem('SistemaUser');

      if(storageUser){
        setUser(JSON.parse(storageUser));
        setLoading(false);
      }

      setLoading(false);
    }

    loadStorage();

  }, [])

  // Cadastrando um novo usuário
  async function signUp(email, password, nome){
    
    setLoadingAuth(true);
    
    // cadastrar usuario em Autentication do firebase
    await firebase.auth().createUserWithEmailAndPassword(email, password)
    .then( async (value) => {
      let uid = value.user.uid;

      // criando no bd a collection users e grava os dados na tabela
      await firebase.firestore().collection('users')
      .doc(uid).set({
        nome: nome,
        avatarUrl: null
      })
      .then( () => {
        let data = {
          uid: uid,
          nome: nome,
          email: value.user.email,
          avatarUrl: null
        };

        setUser(data);
        storageUser(data);
        setLoadingAuth(false);
        toast.success('Bem vindo a plataforma!');

      })
    })
    .catch( (error) => {
      console.log(error);
      toast.error('Ops! Algo deu errado.');
      setLoadingAuth(false);
    })
  }

  // Grava no localStorage também
  function storageUser(data){
    localStorage.setItem('SistemaUser', JSON.stringify(data));
  }

  // Logout do usuario
  async function signOut(){
    await firebase.auth().signOut();
    // Remover do localStorage
    localStorage.removeItem('SistemaUser');
    // Inicializa o setUser
    setUser(null);
  }

  // Fazendo o login do usuário
  async function signIn(email, password){
    setLoadingAuth(true);

    // Autenticando o usuário e senha informado no firebase
    await firebase.auth().signInWithEmailAndPassword(email, password)
    .then( async (value) => {
      let uid = value.user.uid;

      //busca do bd as informações do usuário e senha digitados
      const userProfile = await firebase.firestore().collection('users')
      .doc(uid).get();

      let data = {
        uid: uid,
        nome: userProfile.data().nome,
        avatarUrl: userProfile.data().avatarUrl,
        email: value.user.email
      }

      setUser(data);
      storageUser(data);
      setLoadingAuth(false);
      toast.success('Bem vindo de volta!');
      
    })
    .catch( (error) => {
      console.log(error);
      toast.error('Ops! Algo deu errado.');
      setLoadingAuth(false);
    })

  }

  return(
    <AuthContext.Provider 
    value={{ 
      signed: !!user, 
      user, 
      loading,
      signUp,
      signOut,
      signIn,
      loadingAuth,
      setUser,
      storageUser
      }}>
        {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;