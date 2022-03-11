import store from '../js/store.js';

export default {
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
				tx.executeSql(
					"CREATE TABLE IF NOT EXISTS Devices(id INTEGER NOT NULL PRIMARY KEY, type TEXT NOT NULL, name TEXT NOT NULL, ip TEXT NOT NULL);",
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
			transaction.executeSql('INSERT INTO Devices(type,name,ip) VALUES (?,?,?)',[type,name,ip],
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
    }
}

// database.init();
// database.AddDevice("led","Michał LED2","192.168.8.41:8080")
// database.RemoveDevice("4")

// create new Device
