const axios = require('axios').default

const url = 'https://blockstream.info/api'
const PAGE_SIZE = 25
const fs = require('fs')

function getBlockInfo(blockHash){
    return axios.get(url + `/block/${blockHash}`)
            .then(function(res){
                return res.data
            })
            .catch(err => {
                console.log(`failed to fetch blockInfo for block : ${blockHash} due to err : `, err)
                throw err
            })
}

function getTransactionsForBlockForPage(blockHash, page){
    //caching the response as API call timeouts for some cases
    var name = `cached_files/transaction_page_${page}.json`
    if(!fs.existsSync(name)){
    var start = (page - 1)* PAGE_SIZE
    return axios.get(url + `/block/${blockHash}/txs/${start}`)
                .then(function(res){
                    fs.writeFileSync(name, JSON.stringify(res.data), 'utf8');
                    return res.data
                })
                .catch(err => {
                    console.log(`failed to fetch transactions for block : ${blockHash} and page : ${page} due to err : `, err)
                    throw err
                })
    }else{
        return JSON.parse(fs.readFileSync(name , 'utf8'));
    }
}

function getBlockHashByBlockHeight(blockHeight){
    return axios.get(url + `/block-height/${blockHeight}`)
                .then(function(res){
                    return res.data
                })
                .catch(err => {
                    console.log(`failed to fetch blockHash for blockHeight : ${blockHeight} due to err : `, err)
                    throw err
                })
}


async function fetchAllTransactions(blockHeight){

    const blockHash =  await getBlockHashByBlockHeight(blockHeight)

    console.log('blockhash', blockHash)

    const blockInfo = await getBlockInfo(blockHash)

    const totalPages = Math.floor((blockInfo.tx_count + PAGE_SIZE - 1)/PAGE_SIZE)


    console.log('total Pages', totalPages)
    const transactionPromises = []

    for(let page = 1; page <= totalPages ; page++){
        transactionPromises.push(getTransactionsForBlockForPage(blockHash, page))
    }
    
    const allTransactions = []


    await Promise.all(transactionPromises).then( (transactionsForAllPages) => {
        transactionsForAllPages.forEach(perPage => allTransactions.push(...perPage))
    })
    return allTransactions
}

module.exports = {
    fetchAllTransactions : fetchAllTransactions,
}
