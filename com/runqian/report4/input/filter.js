function _rqDataSet( valueCol, dispCol ) {
	this.valueCol = valueCol;
	this.dispCol = dispCol;
	this.valueColNum = 0;
	this.dispColNum = 0;
	this.rows = new Array();

	this.setColNames = _setRQColNames;
	this.setColTypes = _setRQColTypes;
	this.appendData = _appendRQData;
	this.filter = _filterRQDS;
}

function _setRQColNames( names ) {
	this.colNames = names.split( "," );
	for( var i = 0; i < this.colNames.length; i++ ) {
		if( this.colNames[i] == this.valueCol ) this.valueColNum = i;
		if( this.colNames[i] == this.dispCol ) this.dispColNum = i;
	}
}

function _setRQColTypes( types ) {
	this.colTypes = types.split( "," );
}

function _appendRQData( datas ) {
	var cells = datas.split( "\t" );
	this.rows[ this.rows.length ] = cells;
}

function _filterRQDS( exp ) {
	var s = "";
	for( var i = 0; i < this.colNames.length; i++ ) {
		eval( "var " + this.colNames[i] + ";" );
	}
	for( var i = 0; i < this.rows.length; i++ ) {
		var cells = this.rows[i];
		for( var j = 0; j < cells.length; j++ ) {
			if( this.colTypes[j] == "1" ) eval( this.colNames[j] + " = \"" + cells[j] + "\";" );
			else {
				var colValue = cells[j];
				if( colValue == null || colValue.length == 0 ) colValue = "0";
				eval( this.colNames[j] + " = " + colValue + ";" );
			}
		}
		if( eval( exp ) ) {
			if( s.length > 0 ) s += ";";
			s += cells[ this.valueColNum ] + "," + cells[ this.dispColNum ];
		}
	}
	return s;
}

