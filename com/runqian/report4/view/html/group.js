function _groupClicked( tab ) {
	var tabs = document.getElementById( "rq_tabs" );
	var currTab = document.getElementById( "tab_" + tabs.getAttribute( "currTableId" ) );
	try{ if( ! _submitEditor( document.getElementById( currTab.getAttribute( "reportId" ) ) ) ) return; }catch(e){}
	currTab.className = "";
	tab.className = "rq_curr";
	document.getElementById( "div_" + currTab.getAttribute( "reportId" ) ).style.display = "none";
	document.getElementById( "div_" + tab.getAttribute( "reportId" ) ).style.display = "";
	tabs.setAttribute( "currTableId", tab.getAttribute( "reportId" ) );
	try{ userGroupClicked(); }catch(e){}
}

function group_insertRow() {
	var tabs = document.getElementById( "rq_tabs" );
	var table = document.getElementById( tabs.getAttribute( "currTableId" ) );
	_insertRow( table );	
}

function group_appendRow() {
	var tabs = document.getElementById( "rq_tabs" );
	var table = document.getElementById( tabs.getAttribute( "currTableId" ) );
	_appendRow( table );	
}

function group_deleteRow() {
	var tabs = document.getElementById( "rq_tabs" );
	var table = document.getElementById( tabs.getAttribute( "currTableId" ) );
	_deleteRow( table );	
}

function group_submit() {
	var tabs = document.getElementById( "rq_tabs" );
	try{ if( ! _submitEditor( document.getElementById( tabs.getAttribute( "currTableId" ) ) ) ) return; }catch(e){}
	var ids = tabs.getAttribute( "tables" ).split( "," );
	var s = new StringBuffer();
	for( var i = 0; i < ids.length; i++ ) {
		if( s.length() > 0 ) s.append( "|*|" );
		var table = document.getElementById( ids[i] );
		if( table.getAttribute( "isli" ) ) {
			if( ! _checkRIValid( table ) ) return;
		}
		else {
			if( autoCalcOnlyOnSubmit ) eval( table.id + "_autoCalc( '' )" );
			if( ! eval( ids[i] + "_checkValid()" ) ) return;
		}
		var s1 = "";
		if( table.getAttribute( "isli" ) ) s1 = _getRowReportData( table );
		else {
			var sbs1 = new StringBuffer();
			_getTableData( table, sbs1 );
			s1 = sbs1.toString();
		}
		if( s1.length == 0 ) s1 = " ";
		s.append( s1 );
	}
	try{ if( !eval( "group_valid()" ) ) return; }catch(e){}
	var form = document.getElementById( "group_submitForm" );
	form.data.value = s.toString();
	form.submit();
}

function _saveGroupToLocal( name ) {
	var tabs = document.getElementById( "rq_tabs" );
	try{ if( ! _submitEditor( document.getElementById( tabs.getAttribute( "currTableId" ) ) ) ) return; }catch(e){}
	var html = "<html>\n<body>\n";
	html += _getScriptFunctions();
	try {
		while( my___select.length ) {
			my___select[0].outerHTML = "";
		}
		my___select.outerHTML = "";
	}catch( exception ) {}
	html += _getGroupScriptFunctions();
	var tabArea = document.getElementById( "rq_tabArea" );
	html += tabArea.outerHTML + "\n";
	html += "</body>\n</html>";
	try {
		var fso = new ActiveXObject( "Scripting.FileSystemObject" );
		var fileDialog;
		try {
			fileDialog = eval( "_fileDialog" );
		}catch( exception ) {
			document.body.insertAdjacentHTML( "AfterBegin", "<object id=\"_fileDialog\" width=\"0px\" height=\"0px\" classid=\"clsid:F9043C85-F6F2-101A-A3C9-08002B2F49FB\" codebase=\"http://activex.microsoft.com/controls/vb5/comdlg32.cab\"></object>" );
			fileDialog = eval( "_fileDialog" );
		}
	  	fileDialog.Filter = "HTML Files (*.html)|*.html";
		fileDialog.filename = name;
		try {
			fileDialog.ShowSave();
		}catch( e ) {
			fileDialog.filename = window.prompt( "输入文件路径", name );
		}
		try {
			var f = fso.CreateTextFile( fileDialog.filename, true );
			f.writeLine( html );
			f.Close();
		}catch( e ) { alert( "无法保存文件" + fileDialog.filename ); }
	}catch( exception ) {
		var form = eval( "group_saveToLocalForm" );
		form.fileContent.value = html;
		form.saveAsName.value = name;
		form.submit();
	}
}

function _getGroupScriptFunctions() {
	var html = "<script language=javascript>\n";
	html += _groupClicked.toString() + "\n";
	html += group_insertRow.toString() + "\n";
	html += group_appendRow.toString() + "\n";
	html += group_deleteRow.toString() + "\n";
	html += group_submit.toString() + "\n";
	html += _saveGroupToLocal.toString() + "\n";
	html += _getGroupScriptFunctions.toString() + "\n";
	html += "</scr" + "ipt>\n";
	return html;
}
