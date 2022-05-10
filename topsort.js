class TopSort{

    constructor(graph){
        this.graph = graph
        this.visitedNodes = new Set()
        this.reverseTopologicalOrder = []
        this.adjacencyListRepresentation = new Map()

        graph.edges.forEach( edge => {
            if (!this.adjacencyListRepresentation.has(edge[0])) this.adjacencyListRepresentation.set(edge[0], [])
            this.adjacencyListRepresentation.set(edge[0], [...this.adjacencyListRepresentation.get(edge[0]), edge[1]])
        })

        this.performTopologicalSort()
    }

    
    performTopologicalSort(){
        this.graph.vertices.forEach(vertex => {
            if(!this.visitedNodes.has(vertex)){
                this.dfs(vertex)
            }
        })
    }

    dfs(vertex){
        this.visitedNodes.add(vertex)
        if(this.adjacencyListRepresentation.has(vertex)){
            this.adjacencyListRepresentation.get(vertex).forEach(ancestor => {
                if(!this.visitedNodes.has(ancestor)){
                    this.dfs(ancestor)
                }
            })
        }
        this.reverseTopologicalOrder.push(vertex)
    }


    getTopologicalOrder(){
        return this.reverseTopologicalOrder.reverse()
    }
}

module.exports = {
    TopSort : TopSort
}
