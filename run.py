import os
import sys
from f1f import app

if sys.platform.lower() == "win32":
    os.system('color')

if __name__ == '__main__':
    app.run(debug=True)
