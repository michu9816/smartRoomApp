import store from '../js/store.js';
// import database from '../js/database.js';
import $$ from 'dom7';

const database = {
    db: null,
    shortName: "smartRoom",
    version: "1.0",
    displayName: "smartRoom",
    maxSize: 65535,
  
    // wywoływana kiedy pojawi się błąd w połączeniu do bazy:
    errorHandler: function (error) {
        // alert("Błąd: " + error.message + " kod błędu: " + error.code);
        console.log(error);
    },
    
    // Funkcja wywoływana po udanej transakcji z bazą
    successCallBack: function () {
        // alert("Debuger: sukces!");
        console.log("db ok");
    },
    
    nullHandler: function () {},
    
    //Funkcja wywoływana po starcie apki
    init: function () {
    //    alert("Initialziation");
        if (!window.openDatabase) {
            alert("Twoje urządzenie nie obsługuje SQLite!");
            return;
        }
        this.db = openDatabase(
            this.shortName,
            this.version,
            this.displayName,
            this.maxSize
        ); //tworzy połączenie z bazą
		this.db.transaction(
			function (tx) {
                // alert("creating table!");
				// tx.executeSql(
				// 	"DROP TABLE Devices",
				// 	[],
				// 	this.nullHandler,
				// 	this.errorHandler
				// 	);
				tx.executeSql(
					"CREATE TABLE IF NOT EXISTS Devices(id INTEGER NOT NULL PRIMARY KEY, type TEXT NOT NULL, name TEXT NOT NULL, ip TEXT NOT NULL, position INTEGER NOT NULL);",
					[],
					this.nullHandler,
					this.errorHandler
					);
			}.bind(this),
			this.errorHandler,
			this.successCallBack
		);
		this.GetDevices();
    },
   
    GetDevices: function(callback) {
		if (!window.openDatabase) {
			alert('To urządzenie nie obsługuje SQLite!');
			return;
		}
		this.db.transaction(function(transaction) {
			transaction.executeSql('SELECT * FROM Devices;', [],
			function(transaction, result) {
                let data = [];
                console.log(result);
                for(let i in result.rows){
                    const element = result.rows[i];
                    if(typeof(element) == "object"){
                        data.push(element);
                    }
                }
                // console.log(data);
                store.dispatch("refreshDevicesList",data)
				// console.log(store.getters.devices.value)
			}.bind(this),this.errorHandler);
		}.bind(this),this.errorHandler,this.nullHandler);
		return;
    },
    AddDevice: function(type,name,ip) {
        if (!window.openDatabase) {
            alert('To urządzenie nie obsługuje SQLite!');
            return;
        }
		this.db.transaction(function(transaction) {
            // alert('Adding device 2');
            const devices = store.getters.devices.value;
            const position = parseInt(devices[devices.length - 1]?.position + 1) || 1;
			transaction.executeSql('INSERT INTO Devices(type,name,ip,position) VALUES (?,?,?,?);',[type,name,ip,position],
			this.nullHandler,this.errorHandler);
		}.bind(this));
			
		this.GetDevices(function(){});
		return false;
    },
    RemoveDevice: function(id) {
        if (!window.openDatabase) {
            alert('To urządzenie nie obsługuje SQLite!');
            return;
        }
        
		this.db.transaction(function(transaction) {
			transaction.executeSql('DELETE FROM Devices WHERE id = ?',[id],
			this.nullHandler,this.errorHandler);
		}.bind(this));
			
		this.GetDevices(function(){});
		return false;
    },
    ChangeDevicePosition: function(position,direction) {
        const app = this;
        if (!window.openDatabase) {
            alert('To urządzenie nie obsługuje SQLite!');
            return;
        }
    
        let newPosition = position;
        if(direction == "up"){
            newPosition -= 1;
        }else{
            newPosition += 1;
        }
        console.debug(`Current position ${position}`)
        console.debug(`Moving to ${newPosition}`)
		this.db.transaction(function(transaction) {
			transaction.executeSql('UPDATE Devices SET position = ? WHERE position = ?;',[99,newPosition],
			this.nullHandler,this.errorHandler);
			transaction.executeSql('UPDATE Devices SET position = ? WHERE position = ?;',[newPosition,position],
			this.nullHandler,this.errorHandler);
			transaction.executeSql('UPDATE Devices SET position = ? WHERE position = ?;',[position, 99],
			this.nullHandler,this.errorHandler);
		}.bind(this));
			
		this.GetDevices(function(){});
		return false;
    }
}

database.init();
// database.AddDevice("led","Michał LED2","192.168.8.41:8080")
// database.RemoveDevice("4")

export default database;

// create new Device

$$(document).on('page:init', '.page[data-name="addDevice"]', function (e) {
    $$('#addDevice').on('click', () => {
        let type = $$('#type').val();
        let name = $$('#name').val();
        let ip = $$('#ip').val();
        database.AddDevice(type,name,ip);
    });
});