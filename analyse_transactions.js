const  { fetchAllTransactions } = require('./fetch_transactions')
const TopSort = require('./topsort').TopSort
const fs = require('fs')

function getTransactionGraph(transactions){
    const vertices = new Set()
    const edges = []
    const parentMap = new Map()
    for(let i= 1;i< transactions.length ; i++){
        //starting from i = 1 to filter out the coinbase transaction
        const trx = transactions[i].txid
        const parentTrx = transactions[i].vin[0].txid
        vertices.add(trx)
        vertices.add(parentTrx)
        edges.push({ trx : transactions[i].txid , parentTrx : transactions[i].vin[0].txid })
        parentMap.set(trx, parentTrx)
    }
    return { vertices : vertices , edges : edges , parentMap : parentMap }
}

function writeTransactionChainOutputToFile(allTransactionChains){
    var file = fs.createWriteStream('taskA.txt');
    file.on('error', function(err) { console.log('failed to write output to file for taskA', err) });
    allTransactionChains.forEach(function(v) { file.write(v.join(', ') + '\n'); });
    file.end();
}

function writeMaxSizeTransactionChainsOutputToFile(transactionChainAndItsLengthMapping){
    //top 10 largest chains
    var file = fs.createWriteStream('taskB.txt');
    file.on('error', function(err) { console.log('failed to write output to file for taskB', err) });
    for(let i = 0; i< 10 ; i++){
        file.write(transactionChainAndItsLengthMapping[i].chain.join(', ') + '\n')
    }
    file.end();
}

async function analyseTransactions(blockHeight){
    const transactions = await fetchAllTransactions(blockHeight)
    const graph = getTransactionGraph(transactions)

    //perform a topological sort for this graph
    const topSort = new TopSort(graph)

    const visited = new Set()
    const allTransactionChains = [] 
    const transactionChainAndItsLengthMapping = []
    topSort.getTopologicalOrder().forEach(trans => {
        //using parent map travel up the graph
        var cur = trans
        var currentTransactionChain = []
        while(!visited.has(cur)){
            currentTransactionChain.push(cur)
            visited.add(cur)
            if(graph.parentMap.has(cur)){
                cur = graph.parentMap.get(cur)
            }else{
                break
            }
        }
        if(currentTransactionChain.length !== 0){ 
            allTransactionChains.push(currentTransactionChain) 
            transactionChainAndItsLengthMapping.push( { chain : currentTransactionChain, size : currentTransactionChain.length })
        }
    })

    writeTransactionChainOutputToFile(allTransactionChains)   //task A

    //sort in the descending order of size
    transactionChainAndItsLengthMapping.sort(function(a, b){  
        return b.size - a.size
    })
    
    writeMaxSizeTransactionChainsOutputToFile(transactionChainAndItsLengthMapping) //taskB
}

analyseTransactions(680000)
