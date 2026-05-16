import urllib.parse


def test_root_redirect(client):
    # Arrange
    # Act
    response = client.get('/', allow_redirects=False)
    # Assert
    assert response.status_code == 307
    assert response.headers['location'] == '/static/index.html'


def test_get_activities_success(client):
    # Arrange
    # Act
    response = client.get('/activities')
    # Assert
    assert response.status_code == 200
    data = response.json()
    assert 'Chess Club' in data
    assert 'Programming Class' in data


def test_signup_success(client):
    # Arrange
    activity = urllib.parse.quote('Chess Club')
    email = 'newstudent@mergington.edu'
    # Act
    response = client.post(f'/activities/{activity}/signup', params={'email': email})
    # Assert
    assert response.status_code == 200
    assert 'Signed up' in response.json()['message']


def test_signup_activity_not_found(client):
    # Arrange
    activity = urllib.parse.quote('Nonexistent Activity')
    email = 'student@mergington.edu'
    # Act
    response = client.post(f'/activities/{activity}/signup', params={'email': email})
    # Assert
    assert response.status_code == 404
    assert response.json()['detail'] == 'Activity not found'


def test_signup_already_signed_up(client):
    # Arrange
    activity = urllib.parse.quote('Chess Club')
    email = 'michael@mergington.edu'
    # Act
    response = client.post(f'/activities/{activity}/signup', params={'email': email})
    # Assert
    assert response.status_code == 400
    assert 'already signed up' in response.json()['detail']


def test_remove_participant_success(client):
    # Arrange
    activity = urllib.parse.quote('Chess Club')
    email = 'michael@mergington.edu'
    # Act
    response = client.delete(f'/activities/{activity}/participants', params={'email': email})
    # Assert
    assert response.status_code == 200
    assert 'Removed' in response.json()['message']


def test_remove_participant_activity_not_found(client):
    # Arrange
    activity = urllib.parse.quote('Nonexistent Activity')
    email = 'student@mergington.edu'
    # Act
    response = client.delete(f'/activities/{activity}/participants', params={'email': email})
    # Assert
    assert response.status_code == 404
    assert response.json()['detail'] == 'Activity not found'


def test_remove_participant_not_found(client):
    # Arrange
    activity = urllib.parse.quote('Chess Club')
    email = 'notamember@mergington.edu'
    # Act
    response = client.delete(f'/activities/{activity}/participants', params={'email': email})
    # Assert
    assert response.status_code == 404
    assert response.json()['detail'] == 'Participant not found'


def test_remove_participant_case_insensitive(client):
    # Arrange
    activity = urllib.parse.quote('Chess Club')
    email = 'MICHAEL@MERGINGTON.EDU'
    # Act
    response = client.delete(f'/activities/{activity}/participants', params={'email': email})
    # Assert
    assert response.status_code == 200
    assert 'Removed' in response.json()['message']
