import os
import sys
from f1f import app

# fix console bug on windows for debugging
if sys.platform.lower() == "win32":
    os.system('color')

if __name__ == '__main__':
    app.run(debug=True)
