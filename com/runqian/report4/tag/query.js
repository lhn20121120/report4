// begin
var __III = "并且";
var __JJJ = "或者";
var __KKK = "等于";
var __LLL = "不等于";
var __MMM = "包含";
var __NNN = "不包含";
var __OOO = "大于";
var __PPP = "大于等于";
var __QQQ = "小于";
var __RRR = "小于等于";
var __SSS = "为空";
var __TTT = "不为空";


// end

_initQueryVar();
function queryCondition( v, n, t, o ) {
	this.value = v;
	this.name = n;
	this.type = t;
	this.options = o;
}

function query_add( name ) {
	var newrow = document.getElementById( name + "_conditionTable" ).insertRow(-1);
	newrow.align = "center";
	var newcol1 = newrow.insertCell(-1);
	newcol1.innerHTML = "<input type=checkbox>";
	var newcol2 = newrow.insertCell(-1);
	newcol2.innerHTML = "<input type=text style=\"width:100%\">";
	var newcol3 = newrow.insertCell(-1);
	newcol3.innerHTML = "<select style=\"width:100%\" onchange=\"query_colChanged( '" + name + "', this )\">" + eval( name + "_conditionOptions" ) + "</select>";
	var newcol4 = newrow.insertCell(-1);
	var newcol5 = newrow.insertCell(-1);
	newcol5.innerHTML = "<input type=text style=\"width:100%\">";
	var newcol6 = newrow.insertCell(-1);
	newcol6.innerHTML = "<input type=text style=\"width:100%\">";
	var newcol7 = newrow.insertCell(-1);
	newcol7.innerHTML = "<select style=\"width:100%\"><option value=\" and \">" + __III + "</option><option value=\" or \">" + __JJJ + "</option></select>";
	query_colChanged( name, newcol3.childNodes[0] );
}

function query_colChanged( name, obj ) {
	var value = obj.value;
	var row;
	if( document.all ) {
		row = obj.parentElement.parentElement;
	}
	else row = obj.parentNode.parentNode;
	var options = "";
	var dataType = "1";
	var _conditions = eval( name + "_conditions" );
	for( var i = 0; i < _conditions.length; i++ ) {
		if( value == _conditions[i].value ) {
			options = _conditions[i].options;
			dataType = _conditions[i].type;
			break;
		}
	}
	if( dataType == "1" ) {
		row.cells[3].innerHTML = "<select style=\"width:100%\">" +
			"<option value=\" = \">" +  __KKK + "</option>" +
			"<option value=\" <> \">" +  __LLL + "</option>" +
			"<option value=\" like \">" +  __MMM + "</option>" +
			"<option value=\" not like \">" +  __NNN + "</option>" +
			"<option value=\" > \">" +  __OOO + "</option>" +
			"<option value=\" >= \">" +  __PPP + "</option>" +
			"<option value=\" < \">" +  __QQQ + "</option>" +
			"<option value=\" <= \">" +  __RRR + "</option>" +
			"<option value=\" is null \">" +  __SSS + "</option>" +
			"<option value=\" is not null \">" +  __TTT + "</option></select>";
	}
	else {
		row.cells[3].innerHTML = "<select style=\"width:100%\"><option value=\" = \">" +  __KKK + "</option>" +
			"<option value=\" <> \">" +  __LLL + "</option>" +
			"<option value=\" > \">" +  __OOO + "</option>" +
			"<option value=\" >= \">" +  __PPP + "</option>" +
			"<option value=\" < \">" +  __QQQ + "</option>" +
			"<option value=\" <= \">" +  __RRR + "</option>" +
			"<option value=\" is null \">" +  __SSS + "</option>" +
			"<option value=\" is not null \">" +  __TTT + "</option></select>";
	}
	if( options.length == 0 ) row.cells[4].innerHTML = "<input type=text style=\"width:100%\">";
	else row.cells[4].innerHTML = "<select style=\"width:100%\">" + options + "</select>";
}

function query_del( name ) {
	var table = document.getElementById( name + "_conditionTable" );
	for( var i = table.rows.length - 1; i > 0; i-- ) {
		var row = table.rows[i];
		if( row.cells[0].childNodes[0].checked ) table.deleteRow( row.rowIndex );
	}
}

function query_query( name, dbType ) {
	var table = document.getElementById( name + "_conditionTable" );
	var where = "";
	for( var i = 1; i < table.rows.length; i++ ) {
		var row = table.rows[i];
		var tmp = row.cells[1].childNodes[0].value;
		tmp += row.cells[2].childNodes[0].value;
		var bjf = row.cells[3].childNodes[0].value;
		tmp += bjf;
		var value = row.cells[4].childNodes[0].value;
		if( value == "" ) {
			if( bjf != " is null " && bjf != " is not null " ) continue;
		}
		else {
			if( bjf != " is null " && bjf != " is not null " ) {
				var dataType = "";
				var _conditions = eval( name + "_conditions" );
				for( var k = 0; k < _conditions.length; k++ ) {
					if( row.cells[2].childNodes[0].value == _conditions[k].value ) {
						dataType = _conditions[k].type;
						break;
					}
				}
				if( bjf == " like " || bjf == " not like " ) value = "%" + value + "%";
				tmp += getDBConst( value, dataType, dbType );
			}
		}
		tmp += row.cells[5].childNodes[0].value;
		tmp += row.cells[6].childNodes[0].value;
		where += tmp;
	}
	if( where == "" ) where = "1=1";
	var pos = where.lastIndexOf( " and " );
	if( pos > 0 && pos == where.length - 5 ) where = where.substring( 0, pos );
	pos = where.lastIndexOf( " or " );
	if( pos > 0 && pos == where.length - 4 ) where = where.substring( 0, pos );
	var form = document.getElementById( name + "_queryForm" );
	form.elements[ eval( name + "_macroName" ) ].value = where;
	form.submit();
}

function getDBConst( value, datatype, dbType ) {
	if( value.length == 0 ) return "";
	switch( datatype ) {
		case "1":
			return getCharConst( dbType, value );
		case "2": return value;
		case "3":
			if( dbType == "1" ) return "to_date( '" + value + "', 'yyyy-mm-dd' )";
			else return "'" + value + "'";
		case "4":
			if( dbType == "1" ) return "to_date( '" + value + "', 'hh24:mi:ss' )";
			else return "'" + value + "'";
		case "5":
			if( dbType == "1" ) return "to_date( '" + value + "', 'yyyy-mm-dd hh24:mi:ss' )";
			else return "'" + value + "'";
		default:
			return value;
	}
}

function getCharConst( dbType, value ) {
	var quote = "'";
	if( dbType == "5" || dbType == "6" || dbType == "8") {
		quote = "\"";
	}
	var len = value.length;
	var s = quote;
	for( var i = 0; i < len; i++ ) {
		var ch = value.charAt( i );
		if( ch == quote ) {
			s += ch;
		}
		s += ch;
	}
	s += quote;
	return s;
}

