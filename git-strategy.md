Before starting this project, we put a very light guardrail for a trunk-based rebase strategy for new commits. This allowed for 5 developers to churn out [more than 100 commits in less than 3 days](https://github.com/sedson/sludge-game/commits/main/)

The step-by-step posted in the group chat was:
```
# start from clean slate
git checkout main && git pull

# start on your own stuff
git checkout -b my-work

# open your file editor, change stuff

# save your work in a commit (or chain of commits)
git commit -m "I worked on x y z to the a b c"

# get your local main up to speed on everyone else's stuff, 
# then get back on your feature branch
git checkout main && git pull && git checkout -

# rebase your change(s) onto the existing work
# any conflicts will be highlighted interactively, 
# but most will be a no-op
git rebase -i origin/main

# tip - if you have a chain of several commits 
# you want to squish together into one, 
# this is where you can replace "pick" with "squash" 
# on all lines after the first

# when you've satisfied all conflicts 
# and you're satisfied that commit(s) are ready to push, 
# you can put your local feature branch into remote main
git push origin @:main

# @ is shorthand for "the branch I'm on"
# you could also write git push origin my-work:main
```
