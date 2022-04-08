export const getCanvasElementById = (id: string): HTMLCanvasElement => {
  const canvas = document.querySelector('#canvas')
  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error(`The element of id "${id}" is not a HTMLCanvasElement.
        Make sure a <canvas id="${id}""> element is present in the document.`)
  }
  return canvas
}

export const getCanvasRenderingContext2D = (canvas: HTMLCanvasElement): CanvasRenderingContext2D => {
  const context = canvas.getContext('2d')
  if (context === null) {
    throw new Error('This browser does not support 2-dimensional canvas rendering contexts.')
  }
  return context
}
