import  {ifEmphasize}  from "../computation/treeComputation"

export const highlightCards = (id_list) => {
    id_list.forEach(id => {
        const id_name = "card" + id.toString()
        const TSCard = document.getElementById(id_name)
        if(TSCard !== null){
            TSCard.classList.add("opacity-100")
        }
    })
}

export const deHighlightCards = (id_list) => {
    id_list.forEach(id => {
        const id_name = "card" + id.toString()
        const TSCard = document.getElementById(id_name)
        if(TSCard !== null){
            TSCard.classList.remove("opacity-100")
        }
    })
}

export const moveDownPaths = () => {
    const movedPaths = document.getElementById("movedPaths")
    const originalPaths = document.getElementById("originalPaths")
    
    if (movedPaths && originalPaths) {
        // Move all path elements from originalPaths to movedPaths
        const pathElements = originalPaths.querySelectorAll('path')
        pathElements.forEach(path => {
            movedPaths.appendChild(path)
        })
    }
}

export const moveUpPaths = () => {
    const movedPaths = document.getElementById("movedPaths")
    const originalPaths = document.getElementById("originalPaths")
    
    if (movedPaths && originalPaths) {
        // Move all path elements from movedPaths back to originalPaths
        const pathElements = movedPaths.querySelectorAll('path')
        pathElements.forEach(path => {
            originalPaths.appendChild(path)
        })
    }
}


export const highlightNodes = (id_list) => {
    moveDownPaths()
    deHightLigtEmphasize()
    id_list.forEach(nodeId => {
        const circle = document.getElementById(`node${nodeId}`);
        if (circle) {
            circle.style.fillOpacity = '1'; // 完全不透明
            circle.style.stroke = "#DFDEDE"; // 设置描边颜色为灰色
            circle.style.strokeWidth = 2; // 设置描边宽度  
        }
    })
    highlightCards(id_list)
}

export const deHighlightNodes = (id_list) => {
    moveUpPaths()
    highlightEmphasize()
    id_list.forEach(nodeId => {
        const circle = document.getElementById(`node${nodeId}`);
        if (circle && !Array.from(circle.classList).includes("foldNode")) {
            circle.style.fillOpacity = '0.1'; 
            circle.style.strokeWidth = 0; 
        }
    })
    highlightEmphasize()
    deHighlightCards(id_list) 
}

export const highlightLink = (id) => {
    const link = document.getElementById(id)
    if(link) {
        link.style.stroke = "rgba(243,194,18,1)"
        link.style.strokeWidth = 2
    }
}



export const highlightEmphasize = () => {
    const emphasizeLinks = document.getElementsByClassName("emphasizeLink")
    Array.from(emphasizeLinks).forEach(link => {
        link.style.stroke = "rgba(243,194,18,1)"
    })

    const emphasizeNodes = document.getElementsByClassName("emphasizeNode")
    Array.from(emphasizeNodes).forEach(node => {
        node.style.fillOpacity = 1
        node.style.stroke ="rgba(245, 245, 245,1)"
        node.style.strokeWidth = 2
    })

    const foldNodes = document.getElementsByClassName("foldNode")
    Array.from(foldNodes).forEach(node => {
        node.style.fillOpacity = 0.3
        node.style.stroke ="rgba(245, 245, 245,1)"
        node.style.strokeWidth = 2
    })

}

export const deHightLigtEmphasize = () => {
    const emphasizeLinks = document.getElementsByClassName("emphasizeLink")
    Array.from(emphasizeLinks).forEach(link => {
        link.style.stroke = "rgba(243,194,18, 0.2)"
    })

    const emphasizeNodes = document.getElementsByClassName("emphasizeNode")
    Array.from(emphasizeNodes).forEach(node => {
        node.style.fillOpacity = 0.3
        node.style.stroke ="rgba(245, 245, 245,0.08)"
        node.style.strokeWidth = 2
    })

    const foldNodes = document.getElementsByClassName("foldNode")
    Array.from(foldNodes).forEach(node => {
        node.style.fillOpacity = 0.1
        node.style.strokeWidth = 0
    })


}

export const highlightEmphaizeCards = () => {
    const emphasizeCards = document.getElementsByClassName("emphasizeCard")
    Array.from(emphasizeCards).forEach(card => {
        card.classList.remove("opacity-30")
        card.classList.add("opacity-100")  
    })   

}

export const deHighlightEmphasizeCards = () => {
    const emphasizeCards = document.getElementsByClassName("emphasizeCard")
    Array.from(emphasizeCards).forEach(card => {
        card.classList.remove("opacity-100")
        card.classList.add("opacity-30")
    })   
}






