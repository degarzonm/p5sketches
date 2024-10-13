import os

def main():
    # Obtener el directorio actual
    directorio_actual = os.getcwd()

    # Abrir el archivo de salida en modo escritura
    with open('z.txt', 'w', encoding='utf-8') as archivo_salida:
        # Recorrer directorios, subdirectorios y archivos
        for carpeta_raiz, directorios, archivos in os.walk(directorio_actual):
            # Iterar sobre cada archivo en la carpeta actual
            for nombre_archivo in archivos:
                # Verificar si el archivo termina con '.js' y no es p5.js o p5.sound.min.js
                if nombre_archivo.endswith('.js') and nombre_archivo not in ['p5.js', 'p5.sound.min.js','clipper.js']:
                    # Obtener la ruta completa del archivo
                    ruta_completa = os.path.join(carpeta_raiz, nombre_archivo)

                    # Leer el contenido del archivo .js
                    with open(ruta_completa, 'r', encoding='utf-8') as archivo_js:
                        contenido = archivo_js.read()
                        
                        # Escribir la ruta completa del archivo y su contenido en el archivo de salida
                        archivo_salida.write(f'// Contenido del archivo: {ruta_completa}\n')
                        archivo_salida.write(contenido)
                        archivo_salida.write('\n\n')  # Agregar una línea en blanco entre archivos

if __name__ == '__main__':
    main()
