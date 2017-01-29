var githubHandle = "emilyb7";

function request (url, cb) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      console.log(xhr);
      cb(null, xhr.responseText);
    } else {
      console.log("waiting for response");
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

function waterfall (args, tasks, cb) {
  var nextTask = tasks[0];
  var remainingTasks = tasks.slice(1);
  if (typeof nextTask !== 'undefined') {
    nextTask(args, function(error, result) {
      if (error) {
        cb (error);
        return ;
      }
      waterfall(result, remainingTasks, cb);
    });
    return ;
  }
  return cb(null, args);
}

function getUserRepoDetails (handle, cb) {
  var url = "https://api.github.com/users/" + handle + "/repos";
  request(url, function (error, result) {
    if (error) {
      console.log(error);
      return;
    }
    var response = JSON.parse(result);
    var userDetails = {
      img: response[0].owner.avatar_url,
      repos: response.length,
      // languages: getLanguages(response),
      languages: ["HTML", "CSS", "JavaScript"],
      // stars: countStars(response),
      stars: 18,
      firstRepoUrl: response[0].url
    };
    return cb(null, userDetails);
  });
}

function getRepo (details, cb) {
  var url = details.firstRepoUrl;
  request(url, function(error, result) {
    if (error) {
      console.log(error);
      return;
    }
    var response = JSON.parse(result);
    var repoDetails = {
      name: response.name,
      created: response.created_at,
      issues: response.open_issues,
      watchers: response.watchers
    };
    var returnObj = {
      userDetails: details,
      repoDetails: repoDetails
    };
    return cb(null, returnObj);
  });
}

function updateDOM (error, obj) {
  document.getElementById("github-handle").textContent = githubHandle;
  document.getElementById("github-avatar").src = obj.userDetails.img;
  document.getElementById("my-repos").textContent = obj.userDetails.repos;
  document.getElementById("my-repo-languages").textContent = obj.userDetails.languages.join(", ");
  document.getElementById("my-stars").textContent = obj.userDetails.stars;
  document.getElementById("repo_name").textContent = obj.repoDetails.name;
  document.getElementById("repo_created").textContent = obj.repoDetails.created;
  document.getElementById("repo_open-issues").textContent = obj.repoDetails.issues;
  document.getElementById("repo_watchers").textContent = obj.repoDetails.watchers;
  return;
}

waterfall (githubHandle, [getUserRepoDetails, getRepo], updateDOM);