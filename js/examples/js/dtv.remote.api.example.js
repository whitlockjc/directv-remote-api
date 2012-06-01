$(document).ready(function() {
    // Global variable for the remote.  (I realize this is a faux pas but this is a quick example.)
    var dtvRemote;

    var refreshCurrentChannel = function() {
        dtvRemote.getTuned({callback: function(result) {
            if (result.episodeTitle) {
                $('#program-title').html(result.title + ' <small>' + result.episodeTitle + '</small>');
            } else {
                $('#program-title').text(result.title);
            }

            $('#program-callsign').html(result.callsign + ' <small>' + result.major + '</small>');
        }});
    };

    // Click handler for the remote buttons
    $('#remote-buttons a.btn').click(function(e) {
        dtvRemote.processKey({key: this.id, callback: function(result) {
            if (result.status.code !== 200) {
                alert(result.status.msg);
            }
        }});
    });

    // Enter handler
    $('#ip-address-input').keypress(function(e) {
        if(e.which === 13) {
            $('#ip-address-submit').click();
            e.preventDefault();
        }
    });

    // Click handler for the IP address modal
    $('#ip-address-submit').click(function(e) {
        $('#ip-address-dialog button.btn').toggleClass('disabled');

        try {
            dtvRemote = new DirecTV.Remote({ipAddress: $('#ip-address-input').val()});
        } catch (err) {
            alert(err);
            $('#ip-address-dialog button.btn').toggleClass('disabled');
        }

        dtvRemote.validate({callback: function(result) {
            if (result.status.code === 200) {
                // Initialize the remote
                dtvRemote.getTuned({callback: function(result) {
                    if (result.episodeTitle) {
                        $('#program-title').html(result.title + ' <small>' + result.episodeTitle + '</small>');
                    } else {
                        $('#program-title').text(result.title);
                    }

                    $('#program-callsign').html(result.callsign + ' <small>' + result.major + '</small>');

                    $('#main-container').empty();
                    $('#main-container').append($('#main-content'));
                    $('#main-content').toggleClass('hide');

                    dtvRemote.ccJob = setInterval(refreshCurrentChannel, 5000);

                    $('#ip-address-dialog').modal('hide');
                }});
            } else {
                alert(result.status.msg);
                $('#ip-address-dialog button.btn').toggleClass('disabled');
            }
        }});
    });
});
