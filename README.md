CS4KtoCCP V1.0.0
CS4KtoCCP is a desktop utility application that converts CS4000 configuration into CCP-compatible configuration files.
The converter will export only the global informations (ship name - IMO - SG number - etc.) and the loops, creating one LMX module for each loop inside the CS4000 configuration containing the loop units.

The application is packaged using Node Webkit (NW.js) to provide a cross-platform GUI experience with the flexibility of Node.js and web technologies.

🛠️ Features
🧠 Parses .c4d XML configuration files from CS4000 systems

🔁 Converts and maps them into the CCP format

⚙️ Lightweight and portable via Node Webkit

💻 CodeBase

you can find the opensource code in this github repository:

https://github.com/alecarma2002/CS4KtoCCP.git


📦 Installation for Developers

Clone the repository:

git clone https://github.com/alecarma2002/CS4KtoCCP.git
cd CS4KtoCCP

Install dependencies:

Install Node Webkit (nw.js).
Replace the standard /src folder, package-lock.json and the package.lock files with the one from the repository.
Change the start script (inside package.json) to the path of nw.exe

npm install

Run in development:

npm start

📦 Installation for Users

Use the installer and follow the installation process.



🚀 Usage
Launch the app.

Use the interface to select a .c4d configuration file.

Choose between converting loop unit to Excel or to CCP configuration.

Choose the configTool version.

The converted configuration will be generated and saved in the specified location.

Note that the configuration must be opened with the official ConfigTool and saved before installing it into a live system.



⚠️ Disclaimer
I do not take responsibility for any data loss, misconfiguration, or issues that may arise from using this software. Use it at your own risk.
This application without the official ConfigTool from Consilium is useless since the obtained configuration is rejected from a CCP system if not saved from the ConfigTool.

📄 License
The MIT License (MIT)
Copyright © 2025 Carmagnini Alessandro

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

