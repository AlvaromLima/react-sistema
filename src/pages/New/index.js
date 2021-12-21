import { useState, useEffect, useContext } from 'react';

import firebase from '../../services/firebaseConnection';
import { useHistory, useParams } from 'react-router-dom';

import Header from '../../components/Header';
import Title from '../../components/Title';
import { AuthContext } from '../../contexts/auth';

import './new.css';

import { FiPlusCircle } from 'react-icons/fi';

import { toast } from 'react-toastify'

export default function New(){

   // Buscar o id que colocou na rota
   const { id } = useParams();
   const history = useHistory();

   // Inicializar a lista de Customers
   const [loadCustomers, setLoadCustomers] = useState(true);
   const [customers, setCustomers] = useState([]);
   const [customerSelected, setCustomerSelected] = useState(0);

   // Inicializar o assunto como "Suporte"
   const [assunto, setAssunto] = useState('Suporte');
   // Inicializar o status como "Aberto"
   const [status, setStatus] = useState('Aberto');
   // Inicializa com uma string vazia
   const [complemento, setComplemento] = useState('');
   const [ idCustomer, setIdCustomer ] = useState(false);

   const { user } = useContext( AuthContext );

   // busca todos os customers do banco quando entra na pagina de Novo Chamado
   useEffect( ()=> {
      async function loadCustomers(){
         await firebase.firestore().collection('customers')
         .get()
         .then((snapshot)=>{
            let lista = [];

            snapshot.forEach( (doc)=> {
               lista.push({
                  id: doc.id,
                  nomeFantasia: doc.data().nomeFantasia
               })
            })

            if(lista.length === 0){
               console.log('NENHUMA EMPRESA ENCONTRADA');
               // Carrega pelo menos 1 customers ficticio
               setCustomers([ {
                  id: '1',
                  nomeFantasia: 'FREELA'
               }])
               setLoadCustomers(false);
               return;
            }

            setCustomers(lista);
            setLoadCustomers(false);

            // busca o id no firebase
            if(id){
              loadId(lista);    
            }

         })
         .catch((error)=>{
            console.log('DEU ALGUM ERRO!', error);
            setLoadCustomers(false);
            // Carrega pelo menos 1 customers ficticio
            setCustomers([ {
               id: '1',
               nomeFantasia: ''
            }])
         })
      }

      loadCustomers();

   }, [id]);

   async function loadId(lista){
      await firebase.firestore().collection('chamados').doc(id)
      .get()
      .then((snapshot)=>{
         setAssunto(snapshot.data().assunto);
         setStatus(snapshot.data().status);
         setComplemento(snapshot.data().complemento);

         let index = lista.findIndex(item => item.id === snapshot.data().clienteId)

         setCustomerSelected(index)
         setIdCustomer(true);

      })
      .catch((err)=>{
         console.log('ERRO NO ID PASSADO: ', err);
         setIdCustomer(false);
      })
   }

   async function handleRegister(e){
      e.preventDefault();

      // Atualiza id que foi selecionado em chamados
      if(idCustomer){
         await firebase.firestore().collection('chamados')
         .doc(id)
         .update({
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            status: status,
            complemento: complemento,
            userId: user.uid 
         })
         .then( ()=>{
            toast.success('Chamado Editado com sucesso!');
            setCustomerSelected(0);
            setComplemento('');
            history.push('/dashboard');
         }) 
         .catch((err)=>{
            toast.error('Ops! erro ao registrar, tente mais tarde.')
            console.log(err);
         })

         return;
      }

      // Grava e cria a tabela chamados no banco os campos da tela
      await firebase.firestore().collection('chamados')
      .add({
         created: new Date(),
         cliente: customers[customerSelected].nomeFantasia,
         clienteId: customers[customerSelected].id,
         assunto: assunto,
         status: status,
         complemento: complemento,
         userId: user.uid 
      })
      .then( ()=>{
         toast.success('Chamado criado com sucesso!');
         setComplemento('');
         setCustomerSelected(0);
         setAssunto('Suporte');
      })
      .catch( (error)=>{
         console.log(error);
         toast.error('Ops. Erro ao registrar o chamado, tente mais tarde.');
      })
   }

   // Chamado quando troca o assunto
   function handleChangeSelect(e){
      setAssunto(e.target.value);
      // console.log(e.target.value);
   }

   // Chamado quando troca o status
   function handleOptionChange(e){
      setStatus(e.target.value);
      // console.log(e.target.value);
   }

   // Chamado quando troca o Customers
   function handleChangeCustomers(e){
      //console.log('INDEX DO CLIENTE SELECIONADO: ', e.target.value);
      //console.log('Cliente selecionado ', customers[e.target.value]);
      setCustomerSelected(e.target.value);
   }

   return(
   <div>
      <Header/>

      <div className="content">
        <Title name="Novo chamado">
          <FiPlusCircle size={25} />
        </Title>

        <div className="container">

          <form className="form-profile" onSubmit={handleRegister} >
            <label>Cliente:</label>
            
            {loadCustomers ? (
               <input type="text" disabled={true} value="Carregando clientes..." />
            ) : (
               <select value={customerSelected} onChange={handleChangeCustomers}>
                  {customers.map((item, index) => {
                     return(
                        <option key={item.id} value={index}>
                           {item.nomeFantasia}
                        </option>
                     )
                  })}
               </select>
            )}

            <label>Assunto</label>
            <select value={assunto} onChange={handleChangeSelect}>
               <option value="Suporte">Suporte</option> 
               <option value="Visita Tecnica">Visita Técnica</option> 
               <option value="Financeiro">Financeiro</option> 
            </select>

            <label>Status</label>
            <div className="status" value={status}>
               <input type="radio" name="radio" 
                  value="Aberto" 
                  onChange={handleOptionChange}
                  checked={ status === 'Aberto'}/>
                  <span>Em Aberto</span>
               <input type="radio" name="radio" 
                  value="Progresso" 
                  onChange={handleOptionChange}
                  checked={ status === 'Progresso'}/>
                  <span>Progresso</span>
               <input type="radio" name="radio" 
                  value="Atendido"
                  onChange={handleOptionChange}
                  checked={ status === 'Atendido'}/>
                  <span>Atendido</span>
            </div>

            <label>Complemento</label>
            <textarea type="text" placeholder="Descreva seu problema (opcional)."
               value={complemento} 
               onChange={ (e) => setComplemento(e.target.value)} />

            <button type="submit">Registrar</button>

          </form>
        </div>
      </div>

   </div>  
  )
}