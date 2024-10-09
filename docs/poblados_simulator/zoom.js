class Controls {
    static move(controls) {
      function mousePressed(e) {
         // Verifica si es clic derecho
          controls.viewPos.isDragging = true;
          controls.viewPos.prevX = e.clientX;
          controls.viewPos.prevY = e.clientY;
        
      }
  
      function mouseDragged(e) {
        const { prevX, prevY, isDragging } = controls.viewPos;
        if (!isDragging) return;
  
        const pos = { x: e.clientX, y: e.clientY };
        const dx = pos.x - prevX;
        const dy = pos.y - prevY;
  
        if (prevX !== null && prevY !== null) {
          controls.view.x += dx;
          controls.view.y += dy;
          controls.viewPos.prevX = pos.x;
          controls.viewPos.prevY = pos.y;
        }
      }
  
      function mouseReleased(e) {
         // Verifica si es clic derecho
          controls.viewPos.isDragging = false;
          controls.viewPos.prevX = null;
          controls.viewPos.prevY = null;
        
      }
  
      return {
        mousePressed,
        mouseDragged,
        mouseReleased
      }
    }
  
    static zoom(controls) {
        function worldZoom(e) {
      
            const { x, y, deltaY } = e;
            const direction = deltaY > 0 ? -1 : 1;
            const factor = 0.2;
            const zoom = 1 * direction * factor;
            console.log(deltaY)
            const wx = (x - controls.view.x) / (width * controls.view.zoom);
            const wy = (y - controls.view.y) / (height * controls.view.zoom);
      
            controls.view.x -= wx * width * zoom;
            controls.view.y -= wy * height * zoom;
            controls.view.zoom += zoom;
          }
  
      return { worldZoom }
    }
  
    static resetView(){
      // Restablecer las propiedades de la vista a sus valores predeterminados
      controls.view.x = 0;
      controls.view.y = 0;
      controls.view.zoom = 1;
    }
  }