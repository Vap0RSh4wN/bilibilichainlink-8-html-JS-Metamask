import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

// 如下是module文件的特性
const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "Connected"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        connectButton.innerHTML = "Please install MetaMask"
    }
}

async function getBalance(){
    if (typeof window.ethereum != 'undefined'){
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    // const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        // signer / wallet / someone with some gas
        // contract that we are interacting with
        // ^ABI & Address
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner() //返回provider对应钱包连接的所有东西，其中provider就是metamask。return whichever wallet has connected from provider, which is metamsk
        //也就是当前metamask所连接的account0或1或2...
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            
            await listenForTransactionMine(transactionResponse, provider)
            const pricefeed = await contract.realpricefeed()
            // await listenForTransactionMine(transactionResponse, provider)
            const USD = await contract.MINIMUM_USD()
            console.log("pricefeed", pricefeed.toString())
            console.log("USD", USD.toString())
            console.log('Done!')
        } catch (error) {
            console.log(error)
            console.log("USD", USD.toString())
            console.log("pricefeed", pricefeed.toString())
        }
    } else {
        fundButton.innerHTML = "Please install MetaMask"
    }
}

//故意设为非async function，一会解释
function listenForTransactionMine(transactionResponse,provider){
    console.log(`Mining ${transactionResponse.hash}...`)
    // return new promise()
    //listen for this tx to finish
    return new Promise((resolve,reject)=>{
        provider.once(transactionResponse.hash,(transactionReceipt)=>{
            console.log( `Completed with ${transactionReceipt.confirmations} confirmations. `)
        })//()=>{}表示async function
        // once this transactionResponse.hash is found, 就call这个异步function
        resolve()//这个promise only return once resolve() or reject() is called
    })
    //once sees that transaction hash , it is going to give an input parameter to our listener function the transactionReceipt
}

async function withdraw(){
    if(typeof window.ethereum!='undefined'){
        console.log('Withdrawing...')
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress,abi,signer)
        try{
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse,provider)
        }catch(error){
            console.log(error)
        }
    }
}