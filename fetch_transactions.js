const axios = require('axios').default

const url = 'https://blockstream.info/api'

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

function getTransactionsForBlockForPage(blockHash, start){
    return axios.get(url + `/block/${blockHash}/txs/${start}`)
                .then(function(res){
                    return res.data
                })
                .catch(err => {
                    console.log(`failed to fetch transactions for block : ${blockHash} due to err : `, err)
                    throw err
                })
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
    const PAGE_SIZE = 25

    const blockHash =  await getBlockHashByBlockHeight(blockHeight)

    const blockInfo = await getBlockInfo(blockHash)

    console.log('blockInfo', blockInfo)

    const totalPages = Math.floor((blockInfo.tx_count + PAGE_SIZE - 1)/PAGE_SIZE)


    const transactionPromises = []

    for(let page = 1; page <= totalPages ; page++){
        var start = (page - 1)* PAGE_SIZE
        transactionPromises.push(getTransactionsForBlockForPage(blockHash, start))
    }
    
    const allTransactions = []


    await Promise.all(transactionPromises).then( (transactionPerPage) => {
        allTransactions.push(...transactionPerPage)
    })
    return allTransactions
}

module.exports = {
    fetchAllTransactions : fetchAllTransactions
}
